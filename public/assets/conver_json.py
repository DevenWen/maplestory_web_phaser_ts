#!/usr/bin/env python
# -*- encoding: utf-8 -*-
'''
@File    :   conver_json.py
@Time    :   2021/06/10 21:37:34
@Author  :   Liu YuanYuan :)
@Version :   1.0
@Desc    :   None
'''

# here put the import lib
from collections import OrderedDict
import sys
import json
from typing import Collection
import xmltodict

def conver(filename):
    json_file = open(filename + ".json", "w")
    data_dict = None
    with open(filename) as xml_file:
        data_dict = xmltodict.parse(xml_file.read())
        xml_file.close()


    result = parsemap(data_dict)
    json_file.write(json.dumps(result[filename[0:-4]]))
    json_file.close()
 
def parsemap(node):
    if type(node) is str:
        return node

    if type(node) is list:
        return parsearray(node)
    new_node = OrderedDict()
    
    if "imgdir" in node:
        child = parsemap(node["imgdir"])
        if type(child) is list:
            for item in child:
                new_node[item["name"]] = item
        if type(child) is OrderedDict:
            new_node[child["name"]] = child
    if "string" in node:
        # 匹配值为 kv
        child = parsemap(node["string"])
        if type(child) is list:
            for item in child:
                new_node[item["name"]] = item["value"]
        if type(child) is OrderedDict:
            new_node[child["name"]] = child["value"]
    
    if "uol" in node:
        # 匹配值为 kv
        child = parsemap(node["uol"])
        if type(child) is list:
            for item in child:

                new_node[item["name"]] = {
                    "name": item["name"],
                    "path": item["value"],
                    "type": "uol"
                }

        if type(child) is OrderedDict:
            new_node[child["name"]] = {
                    "name": child["name"],
                    "path": child["value"],
                    "type": "uol"
                }

    if "int" in node:
        child = parsemap(node["int"])
        if type(child) is list:
            for item in child:
                new_node[item["name"]] = int(item["value"])
        if type(child) is OrderedDict:
            new_node[child["name"]] = int(child["value"])
    
    if "canvas" in node:
        # print("todo canvas")
        child = parsemap(node["canvas"])
        for item in child:
            print(item)
            # new_node[item["name"]] = {
            #     "type": "canvas",
            #     "name": item["name"]
            # }

    if "@value" in node:
        new_node["value"] = node["@value"]
    new_node["_keys"] = list(new_node.keys())

    if "@name" in node:
        new_node["name"] = node["@name"]
    return new_node


def parsearray(array):
    if not type(array) is list:
        return parsemap(array)

    new_array = []
    for item in array:
        new_array.append(parsemap(item))
    return new_array

def parsecanvas(node):
    new_node = OrderedDict()
    # TODO


if __name__ == '__main__':
    conver(sys.argv[1])
    