class ArrayUtils {
  static getMedianValue(arr, type = "null", isRound = false) {
    arr = this.sort(arr, type);
    if (arr.length % 2 === 0) {
      return isRound ? Math.round((arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2) : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2;
    } else {
      return arr[(arr.length - 1) / 2];
    }
  }

  /**中位数清除尾部空数据 */
  static getMedianValueClearTailZero(arr, isRound = false) {
    let newArr = this.clearTailZero(arr);
    let resultArr = this.sort(newArr, "asc");
    if (resultArr.length % 2 === 0) {
      return isRound ? Math.round((resultArr[resultArr.length / 2 - 1] + resultArr[resultArr.length / 2]) / 2) : (resultArr[resultArr.length / 2 - 1] + resultArr[resultArr.length / 2]) / 2;
    } else {
      return resultArr[(resultArr.length - 1) / 2];
    }
  }

  /**清空数组尾部为0 */
  static clearTailZero(arr) {
    let i = arr.length - 1;
    while (i >= 0 && arr[i] === 0) {
      i--;
    }
    return arr.slice(0, i + 1);
  }

  static getSumValue(arr) {
    return arr.reduce((acc, val) => Number(acc) + Number(val), 0);
  }

  static getMaxValue(arr) {
    if (Array.isArray(arr)) {
      return Math.max(...arr);
    }
    return 0;
  }

  static getMaxValueIndex(arr) {
    if (Array.isArray(arr)) {
      return arr.indexOf(Math.max(...arr));
    }
    return 0;
  }

  static getAverageValue(arr, isRound = false) {
    const sum = arr.reduce((acc, val) => Number(acc) + Number(val), 0);
    return isRound ? Math.round(sum / arr.length) : sum / arr.length;
  }

  /**平均数清除尾部空数据 */
  static getAverageValueClearTailZero(arr, isRound = false) {
    let newArr = this.clearTailZero(arr);
    const sum = newArr.reduce((acc, val) => Number(acc) + Number(val), 0);
    return isRound ? Math.round(sum / newArr.length) : sum / newArr.length;
  }

  static sort(arr, type = "asc") {
    if (type == "desc") {
      arr.sort((a, b) => b - a);
    } else if (type == "asc") {
      arr.sort((a, b) => a - b);
    }
    return arr;
  }

  static dataList2TreeNode(dataList, idKey = "id", parentIdKey = "parentId", childrenKey = "children") {
    let treeNode = [];
    let dataMap = dataList.reduce((result, item) => {
      result[item[idKey]] = item;
      if (item[parentIdKey] == null || item[parentIdKey] == 0 || item[parentIdKey] == "0") {
        treeNode.push(item);
      }
      return result;
    }, {});
    for (const key in dataMap) {
      let item = dataMap[key];
      if (item[parentIdKey] != 0 && item[parentIdKey] != "0" && item[parentIdKey] != null) {
        let parent = dataMap[item[parentIdKey]];
        if (parent) {
          if (!parent[childrenKey]) {
            parent[childrenKey] = [];
          }
          parent[childrenKey].push(item);
        }
      }
    }
    return treeNode;
  }

  static findTreeNode(tree, value, idKey = "id", childrenKey = "children") {
    for (let i = 0; i < tree.length; i++) {
      let node = tree[i];
      if (node[idKey] === value) {
        return node;
      }
      if (node[childrenKey]) {
        let result = this.findTreeNode(node[childrenKey], value, idKey, childrenKey);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  static addTreeNode(tree, node, parentIdKey = "parentId", idKey = "id", childrenKey = "children") {
    if (node[parentIdKey] === 0) {
      tree.push(node);
    } else {
      let parent = this.findTreeNode(tree, node[parentIdKey], idKey, childrenKey);
      if (parent) {
        if (!parent[childrenKey]) {
          parent[childrenKey] = [];
        }
        parent[childrenKey].push(node);
      }
    }
    return tree;
  }

  static deleteTreeNode(tree, value, idKey = "id", childrenKey = "children") {
    for (let i = 0; i < tree.length; i++) {
      let node = tree[i];
      if (node[idKey] === value) {
        tree.splice(i, 1);
        if (tree.length === 0) {
          tree = null;
        }
        return tree;
      }
      if (node[childrenKey]) {
        node[childrenKey] = this.deleteTreeNode(node[childrenKey], value, idKey, childrenKey);
      }
    }
    return tree;
  }

  static setTreeParentNames(tree, parentNames = [], nameKey = "name", childrenKey = "children", parentKey = "parentNames") {
    tree.map((child) => {
      child = this.setTreeNodeParentNames(child, [], nameKey, childrenKey, parentKey);
      return child;
    });
    return tree;
  }

  static setTreeNodeParentNames(node, parentNames = [], nameKey = "name", childrenKey = "children", parentKey = "parentNames") {
    node[parentKey] = parentNames;
    if (node[childrenKey]) {
      node[childrenKey].map((child, index) => {
        this.setTreeNodeParentNames(child, parentNames.concat(node[nameKey]), nameKey, childrenKey, parentKey);
      });
    }
    return node;
  }
}

export default ArrayUtils;
