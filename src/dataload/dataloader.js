var Node = function Node(name, parent) {
	this['name'] = name;
  this['..'] = parent;
  this['_keys'] = [];
};

Node.prototype.forEach = function(callback) {
  for (var i = 0; i < this._keys.length; i++) {
    var key = this._keys[i];
    callback(this[key], key, i)
  }
};

var UOL = function UOL(name, parent, path) {
  this['name'] = name;
  this['..'] = parent;
  this['path'] = path;
};

UOL.prototype.getPath = Node.prototype.getPath = function() {
  var cur = this;
  var path = '';
  do {
    path = cur.name + '/' + path;
    cur = cur['..'];
  } while (cur !== null)

  return path;
};

function isReservedDataObject(name) {
  return ['name', 'ITEMID', '..', '_image', 'path', '_keys'].indexOf(name) != -1;
};

function resolveUOL(curnode) {
  var cur = curnode['..'];
  var elements = curnode.path.split('/');
  while (elements.length > 0) {
    if (cur[elements[0]] === null) {
      return null;
    }
    cur = cur[elements[0]];
    elements = elements.slice(1);
  }
  return cur;
};

function parseNodeType(node, prevNode, name) {
  var ret = new Node(name === null ? node.getAttribute("name") : name, prevNode);

  function parseSubprops() {
    for (var i = 0; i < node.children.length; i++) {
      var subnode = node.children[i];
      var subnodeName = subnode.getAttribute("name");
      ret[subnodeName] = parseNodeType(subnode, ret, subnodeName);
      ret['_keys'].push(subnodeName);
    }
  }

  var value = node.getAttribute('value')
  switch (node.tagName) {
    case "int":
    case "short":
      return parseInt(value, 10);
    case "string":
      return value;
    case "null":
      return ret;
    case "vector":
      ret['X'] = parseInt(node.getAttribute('x'), 10);
      ret['Y'] = parseInt(node.getAttribute('y'), 10);
      return ret;
      case "canvas":
        ret['_image'] = {
          width : parseInt(node.getAttribute('width'), 10),
          height : parseInt(node.getAttribute('height'), 10),
          uri : node.getAttribute('basedata')
        };
        parseSubprops();
        return ret;

      case 'imgdir':
        parseSubprops();
        return ret;

      case 'uol':
        return new UOL(ret.name, prevNode, value);
  }
}

function reparseTreeAsNodes(json) {
  function parseNode(curnode, parentNode) {
    if (typeof curnode !== 'object') return curnode;
    if (curnode['type'] === 'uol') {
      return new UOL(curnode['name'], parentNode, curnode['path']);
    }
    
    var node = new Node(curnode['name'], parentNode);
    
    if (curnode['type'] === 'canvas') {
      node['_image'] = curnode['_image'];
    } else if (curnode['type'] === 'vector') {
      node['X'] = curnode['X'];
      node['Y'] = curnode['Y'];
      return node;
    }
    
    var keys = curnode['_keys'];
    for (var i = 0; i < keys.length; i++) {
      var nodeName = keys[i];
      var innerNode = curnode[nodeName];
      var realNode = parseNode(innerNode, node);
      
      node[nodeName] = realNode;
      node['_keys'].push(nodeName);
    }
    
    return node;
  }
  return parseNode(json, null);
}

function getElementFromJSON(json, path) {
  if (!json.parsed_data) {
    json.parsed_data = {};
  } else if (path in json.parsed_data) {
    return json.parsed_data[path];
  }

  var node = json;
  if (path !== "null") {
    var pathelements = path.split('/');

    while (pathelements.length > 0) {
      var pathelement = pathelements[0];
      pathelements = pathelements.slice(1);
      if (node['_keys'].indexOf(pathelement) !== -1) {
        node = node[pathelement];
      } else {
        return null;
      }
    }
  }

  json.parsed_data[path] = node;
  return node;
}


// function getDataNode(key, callback, sync) {
//   var imgpos = key.indexOf('.img');
//   if (imgpos == -1) {
//     throw 'No img found in ' + key;
//   }

//   var path = key.substr(0, imgpos + 4);
//   var subelements = key.substr(imgpos + 5);

//   // todo objectStorage 改用缓存进行
//   if (path in objectStorage) {
//     var info = objectStorage[path];
//     if (!info.loaded) {
//       info.callbacks.push([ callback, subelements ]);
//     } else {
//       callback(getElementFromJSON(info.data, subelements));
//     }
//   } else {
//     objectStorage[path] = {
//       callbacks : [ [ callback, subelements ] ],
//       loaded : false
//     };

//     var xhttp = new XMLHttpRequest();
//     var url = 'http://127.0.0.1:8082/' + path + '.xml.json';
//     console.log(url);
//     xhttp.open("GET", url, sync !== true);
//     xhttp.onreadystatechange = function() {
//       if (xhttp.readyState == 4) {
//         var info = objectStorage[path];
//         info.data = reparseTreeAsNodes(JSON.parse(xhttp.response));
//         info.loaded = true;

//         for (var i = 0; i < info.callbacks.length; i++) {
//           var callback = info.callbacks[i][0];
//           var subelement = info.callbacks[i][1];

//           callback(getElementFromJSON(info.data, subelement));
//         }
//       }
//     }
//     xhttp.send();
//     if (sync) {
//       return JSON.parse(xhttp.response);
//     }
//   }
// };

function getItemDataNode(itemid, subelement, callback, sync) {
  var path = getItemDataLocation(itemid);
  return getDataNode(path + subelement, function(obj) {
    if (obj !== null) {
      obj['ITEMID'] = itemid;
    }
    callback(obj);
  }, sync)
};

function getItemInventory(id) {
  return Math.floor(id / 1000000);
};

function getItemType(id) {
  return Math.floor(id / 10000);
};

function padLeft(text, finalLength, string) {
  text = String(text);
  while (text.length < finalLength) {
    text = string + text;
  }
  return text;
};

function padRight(text, finalLength, string) {
  text = String(text);
  while (text.length < finalLength) {
    text += string;
  }
  return text;
};

function getWZItemTypeName(id) {
  var tmp = context.getItemType(id);

  if (id < 10000) {
    return context.padLeft(id, 8, '0') + '.img';
  }

  switch (tmp) {
    case 100:
      return 'Cap';
    case 104:
      return 'Coat';
    case 105:
      return 'Longcoat';
    case 106:
      return 'Pants';
    case 107:
      return 'Shoes';
    case 108:
      return 'Glove';
    case 109:
      return 'Shield';
    case 110:
      return 'Cape';
    case 111:
      return 'Ring';
    case 117:
      return 'MonsterBook';
    case 120:
      return 'Totem';

    case 101:
    case 102:
    case 103:
    case 112:
    case 113:
    case 114:
    case 115:
    case 116:
    case 118:
    case 119:
      return 'Accessory';

    case 121:
    case 122:
    case 123:
    case 124:
    case 130:
    case 131:
    case 132:
    case 133:
    case 134:
    case 135:
    case 136:
    case 137:
    case 138:
    case 139: // FISTFIGHT!!! (sfx: barehands, only 1 item: 1392000)
    case 140:
    case 141:
    case 142:
    case 143:
    case 144:
    case 145:
    case 146:
    case 147:
    case 148:
    case 149:
    case 150:
    case 151:
    case 152:
    case 153:
    case 154: // 1542061 is the only wep, 1532061 is missing... NEXON
    case 155: // Fans of the wall, oh wait
    case 160:
    case 170:
      return 'Weapon';

    case 161:
    case 162:
    case 163:
    case 164:
    case 165:
      return 'Mechanic';

    case 168:
      return 'Bits';

    case 180:
    case 181:
      return 'PetEquip';

    case 184:
    case 185:
    case 186:
    case 187:
    case 188:
    case 189:
      return 'MonsterBattle';

    case 190:
    case 191:
    case 192:
    case 193:
    case 198:
    case 199:
      return 'TamingMob';

    case 194:
    case 195:
    case 196:
    case 197:
      return 'Dragon';

    case 166:
    case 167:
      return 'Android';

    case 996:
      return 'Familiar';
  }
};

function getItemDataLocation(id) {
  var inv = getItemInventory(id);
  var type = getItemType(id);
  var url = '';
  var location = '';

  if (type == 996) {
    url = location + 'Character.wz/Familiar/' + padLeft(id, 7, '0') + '.img/';
  } else if (type < 5) {
    switch (type) {
      case 0:
      case 1:
        url = location + 'Character.wz/' + padLeft(id, 8, '0') + '.img/';
        break;
      case 2:
        url = location + 'Character.wz/Face/' + padLeft(id, 8, '0') + '.img/';
        break;
      case 3:
        url = location + 'Character.wz/Hair/' + padLeft(id, 8, '0') + '.img/';
        break;
    }
  } else if (inv == 1) {
    name = getWZItemTypeName(id);
    url = location + 'Character.wz/' + name + '/' + padLeft(id, 8, '0') + '.img/';
  } else {
    if (type == 500) {
      url = location + 'Inventory.wz/Pet/' + id + '.img/';
    } else {
      var typeid = padLeft(type, 4, '0') + '.img';
      var typename = '';
      switch (Math.floor(type / 100)) {
        case 2:
          typename = 'Consume';
          break;
        case 3:
          typename = 'Install';
          break;
        case 4:
          typename = 'Etc';
          break;
        case 5:
          typename = 'Cash';
          break;
      }
      url = location + 'Inventory.wz/' + typename + '/' + typeid + '/' + context.padLeft(id, 8, '0') + '/';
    }
  }
  return url;
};

export {getElementFromJSON, reparseTreeAsNodes, getItemDataLocation, Node}