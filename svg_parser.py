from xml.dom import minidom

f = open("river_campus_original.svg", "r")
svg = minidom.parse(f)

# print svg.getElementsByTagName("g")

paths = 0

for g in svg.getElementsByTagName("g"):
	if (g.getAttribute("id") == "roads_4"):
			paths = g.getElementsByTagName("polyline")
			break

vertices = {}
# get list of all vertices
for polyline in paths:
	coordinates = polyline.getAttribute("points").split(" ")
	for i, c in enumerate(coordinates):
		if (c in vertices):
			n = vertices[c]["neighbors"]
			if (i != 0):
				if not coordinates[i-1] in n:
					n.append(coordinates[i-1])
			if (i+1 < len(coordinates)):
				if not coordinates[i+1] in n:
					n.append(coordinates[i+1])
		else:
			neighbors = []
			if (i != 0):
				neighbors.append(coordinates[i-1])
			if (i+1 < len(coordinates)):
				neighbors.append(coordinates[i+1])

			x, y = c.split(",")
			vertices[c] = {"neighbors": neighbors, "x": x, "y": y}



print "num vertices (initial): " + str(len(vertices))

# set up edge_id system, pre-create edges array
for key, v in vertices.items():
	v["edges"] = [-1] * len(v["neighbors"])

# use this collection to get list of all edges
edges = []
edge_id = 0
for key1, v1 in vertices.items():
	for i, e_id in enumerate(v1["edges"]):
		if (e_id == -1):
			key2 = v1["neighbors"][i]
			edges.append(map(lambda x : float(x), key1.split(",") + key2.split(",")))
			v1["edges"][i] = edge_id
			index_in_neighbor = vertices[key2]["neighbors"].index(key1)
			vertices[key2]["edges"][index_in_neighbor] = edge_id
			edge_id += 1

def reverse(l):
	i = len(l) - 2
	e = [None] * len(l)
	for x in range(0, len(l), 2):
		e[i] = l[x]
		e[i+1] = l[x+1]
		i = i - 2;
	return e

v_to_del = 0
for key, v in vertices.items():
	if len(v["neighbors"]) == 2:
		v_to_del = v_to_del + 1
		e1_id = v["edges"][0]
		e2_id = v["edges"][1]
		e1 = edges[e1_id]
		e2 = edges[e2_id]
		if (e1[0] == e2[0] and e1[1] == e2[1]):
			e = reverse(e1)
			e = e[0:len(e) - 2]
			e = e + e2
			# print "a"
			# print e1
			# print e2
			# print e
		elif (e1[0] == e2[len(e2) - 2] and e1[1] == e2[len(e2) - 1]): 
			e_1 = reverse(e1)
			e_2 = reverse(e2)
			e_1 = e_1[0:len(e1) - 2]
			e = e_1 + e_2
			# print "b"
			# print e1
			# print e2
			# print e
		elif (e1[len(e1) - 2] == e2[0] and e1[len(e1) - 1] == e2[1]):
			e = e1[0:len(e1) - 2] + e2
			# print "c"
			# print e1
			# print e2
			# print e
		elif (e1[len(e1) - 2] == e2[len(e2) - 2] and e1[len(e1) - 1] == e2[len(e2) - 1]):
			e_2 = reverse(e2)
			e = e1[0:len(e1) - 2] + e_2
			# print "d"
			# print e1
			# print e2
			# print e
		else:
			print "wtf man"

		# e1_id = v["edges"][0]
		# e2_id = v["edges"][1]
		# e1 = edges[e1_id]
		# e2 = edges[e2_id]

		edges[e1_id] = e
		edges[e2_id] = []
		v1_key = v["neighbors"][0]
		v2_key = v["neighbors"][1]
		v1 = vertices[v1_key]
		v2 = vertices[v2_key]
		# update v1 references
		v1_i_of_v = v1["edges"].index(e1_id)
		v1["neighbors"][v1_i_of_v] = v2_key
		# update v2 references
		v2_i_of_v = v2["edges"].index(e2_id)
		v2["edges"][v2_i_of_v] = e1_id
		v2["neighbors"][v2_i_of_v] = v1_key


		del vertices[key]

		# edges[e1_id] = e
		# neighbor1 = v["neighbors"][0]
		# neighbor2 = v["neighbors"][1]
		# print neighbor1
		# print neighbor2
		# print e

		# vertex_to_recalibrate = vertices[v["neighbors"][1]]


		# v2r_index = vertex_to_recalibrate["edges"].index(e2_id)
		# vertex_to_recalibrate["edges"][v2r_index] = e2_id

		# # TODO: vector change here
		# vertex_to_recalibrate["neighbors"][v2r_index] = v["neighbors"][0]
		# del vertices[key]

		# edges[e2_id] = []
			




	# del vertices[key]

print "num vertices (post-op): " + str(len(vertices))
print "should have deleted: " + str(v_to_del)


# Special code for Jeremy
# I do not know what it does
# assign vertices numeric IDs
vertex_map = {}
i = 0
for key, v in vertices.items():
	vertex_map[key] = i
	i += 1


edge_map = [-1] * len(edges)

# output edge data
output = open("edgedata.js", "w")
output.write("var EDGE_DATA = [\n")

edge_counter = 0
counter = 0
for e in edges:
	if (e != []):
		output.write("    %s,\n" % e)
		edge_map[counter] = edge_counter
		edge_counter += 1
	counter += 1

output.write("];\n")
output.close()


# output vertex data
output2 = open("graphdata.js", "w")
output2.write("var VERTICES = [\n")
for key, v in vertices.items():
	output2.write("  {\n")
	output2.write("    id: " + str(vertex_map[key]) + ",\n")
	output2.write("    x: " + str(v["x"]) + ",\n")
	output2.write("    y: " + str(v["y"]) + ",\n")
	output2.write("    neighbors: " + str(map(lambda x : vertex_map[x], v["neighbors"])) + ",\n")
	output2.write("    edges: " + str(map(lambda x : edge_map[x], v["edges"])) + ",\n")
	output2.write("  },\n")
output2.write("];\n")
output2.close()

print "number of edges: " + str(len(edges))
print "edge counter: " + str(edge_counter)
