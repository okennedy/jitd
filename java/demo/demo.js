// Generated by CoffeeScript 1.8.0
(function() {
  var addChildren, deleteChild, deleteChildren, diagonal, g, h, i, initTree, loadTree, m, mergeTrees, refreshTree, root, task, toggleTreeNode, tree, updateJson, updateTree, vis, w, workQueue;

  tree = null;

  vis = null;

  m = [20, 120, 20, 120];

  w = 630;

  h = 460;

  if (document.body && document.body.offsetWidth) {
    w = document.body.offsetWidth;
    h = document.body.offsetHeight;
  }

  if (document.compatMode === 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {
    w = document.documentElement.offsetWidth;
    g = document.documentElement.offsetHeight;
  }

  if (window.innerWidth && window.innerHeight) {
    w = window.innerWidth;
    g = window.innerHeight;
  }

  h = h - 60 - m[0] - m[2];

  w = w - 60 - m[1] - m[3];

  i = 0;

  root = null;

  diagonal = d3.svg.diagonal().projection(function(d) {
    return [d.y, d.x];
  });

  workQueue = [];

  initTree = function() {
    tree = d3.layout.tree().size([h, w]);
    vis = d3.select("#body").append("svg:svg").attr("width", w + m[1] + m[3]).attr("height", h + m[0] + m[2]).append("svg:g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    return setInterval((function() {
      var op, _results;
      _results = [];
      while (workQueue.length > 0) {
        op = workQueue.splice(0, 1)[0];
        console.log(op);
        op.perform();
        _results.push(updateTree(op.node));
      }
      return _results;
    }), 100);
  };

  task = function(node, op) {
    return workQueue.push({
      perform: op,
      node: node
    });
  };

  loadTree = function(json) {
    root = json;
    root.x0 = h / 2;
    root.y0 = 0;
    return task(root, function() {
      return null;
    });
  };

  updateJson = function(x) {
    if ((root == null) || root.name !== x.name) {
      return loadTree(x);
    } else {
      return mergeTrees(root, x);
    }
  };

  deleteChild = function(node, name) {
    var c, idx, y;
    console.log("Delete " + name + " from " + node.name);
    c = node.children != null ? node.children : node._children;
    idx = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = c.length; _i < _len; _i++) {
        y = c[_i];
        _results.push(y.name);
      }
      return _results;
    })()).indexOf(name);
    if (idx >= 0) {
      return c.splice(idx, 1);
    }
  };

  addChildren = function(node, children) {
    var c;
    console.log("Add " + children.length + " to " + node.name);
    c = node.children != null ? node.children : node._children;
    if (c != null) {
      console.log("append");
      if (node.children != null) {
        return node.children = node.children.concat(children);
      } else {
        return node._children = node._children.concat(children);
      }
    } else {
      console.log("replace");
      return node.children = children;
    }
  };

  deleteChildren = function(node) {
    console.log("Clear " + node.name);
    if (old.children != null) {
      delete old.children;
    }
    if (old._children != null) {
      return delete old._children;
    }
  };

  mergeTrees = function(old, received) {
    var mergeChildren;
    mergeChildren = function(children) {
      var x, _fn, _i, _len;
      _fn = function(x) {
        var idx, y;
        idx = ((function() {
          var _j, _len1, _ref, _results;
          _ref = received.children;
          _results = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            y = _ref[_j];
            _results.push(y.name);
          }
          return _results;
        })()).indexOf(x.name);
        if (idx >= 0) {
          return mergeTrees(x, received.children.splice(idx, 1)[0]);
        } else {
          return task(old, function() {
            return deleteChild(old, x.name);
          });
        }
      };
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        x = children[_i];
        _fn(x);
      }
      if ((received.children != null) && received.children.length > 0) {
        return task(old, function() {
          return addChildren(old, received.children);
        });
      }
    };
    if ((received.children != null)) {
      if ((old._children != null)) {
        return mergeChildren(old._children);
      } else {
        if ((old.children != null)) {
          return mergeChildren(old.children);
        } else {
          return task(old, function() {
            return addChildren(old, received.children);
          });
        }
      }
    } else {
      if ((old.children != null) || (old._children != null)) {
        return task(old, function() {
          return deleteChildren(old);
        });
      }
    }
  };

  updateTree = function(source) {
    var duration, link, node, nodeEnter, nodeExit, nodeUpdate, nodes;
    duration = 500;
    nodes = tree.nodes(root).reverse();
    node = vis.selectAll("g.node").data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });
    nodeEnter = node.enter().append("svg:g").attr("class", "node").attr("transform", source ? (function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    }) : (function(d) {
      return "translate(" + d.sourceY + "," + d.sourceX + ")";
    })).on("click", function(d) {
      toggleTreeNode(d);
      return updateTree(d);
    });
    nodeEnter.append("svg:circle").attr("r", 1e-6).style("fill", function(d) {
      if (d._children) {
        return "lightsteelblue";
      } else {
        return "#fff";
      }
    });
    nodeEnter.append("svg:text").attr("x", function(d) {
      if (d.children || d._children) {
        return -10;
      } else {
        return 10;
      }
    }).attr("dy", ".35em").attr("text-anchor", function(d) {
      if (d.children || d._children) {
        return "end";
      } else {
        return "start";
      }
    }).text(function(d) {
      return d.name;
    }).style("fill-opacity", 1e-6);
    nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });
    nodeUpdate.select("circle").attr("r", 4.5).style("fill", function(d) {
      if (d._children) {
        return "lightsteelblue";
      } else {
        return "#fff";
      }
    });
    nodeUpdate.select("text").style("fill-opacity", 1);
    nodeExit = node.exit().transition().duration(duration).attr("transform", source ? (function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    }) : (function(d) {
      return "translate(" + d.sourceY + "," + d.sourceX + ")";
    })).remove();
    nodeExit.select("circle").attr("r", 1e-6);
    nodeExit.select("text").style("fill-opacity", 1e-6);
    link = vis.selectAll("path.link").data(tree.links(nodes), function(d) {
      return d.target.id;
    });
    link.enter().insert("svg:path", "g").attr("class", "link").attr("d", source != null ? function(d) {
      var o;
      o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    } : function(d) {
      var o;
      o = {
        x: d.sourceX,
        y: d.sourceY
      };
      return diagonal({
        source: o,
        target: o
      });
    }).transition().duration(duration).attr("d", diagonal);
    link.transition().duration(duration).attr("d", diagonal);
    link.exit().transition().duration(duration).attr("d", source != null ? function(d) {
      var o;
      o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    } : function(d) {
      var o;
      o = {
        x: d.sourceX,
        y: d.sourceY
      };
      return diagonal({
        source: o,
        target: o
      });
    }).remove();
    return nodes.forEach(function(d) {
      d.x0 = d.x;
      return d.y0 = d.y;
    });
  };

  toggleTreeNode = function(d) {
    if (d.children) {
      d._children = d.children;
      return d.children = null;
    } else {
      d.children = d._children;
      return d._children = null;
    }
  };

  refreshTree = function(url) {
    return d3.json(url, function(err, json) {
      return updateJson(json);
    });
  };

  window.initTree = initTree;

  window.refreshTree = refreshTree;

}).call(this);
