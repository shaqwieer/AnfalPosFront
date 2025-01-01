export function spliceChild(tree, keyToRemove) {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
  
      if (node.key === keyToRemove) {
        tree.splice(i, 1);
        return true; 
      }
  
      if (node.children && node.children.length > 0) {
        const result = spliceChild(node.children, keyToRemove);
        if (result) {
          return true; 
        }
      }
    }
  
    return false; 
  }
  export function updateNode(tree, keyToUpdate, newData) {
    return tree.map(node => {
      if (node.key === keyToUpdate) {
        return {
          ...node,
          data: { ...node.data, ...newData }
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateNode(node.children, keyToUpdate, newData)
        };
      }
      return node;
    });
  }

  export function extractToValues(items) {
    let toValues = [];
    items.forEach((item) => {
        if (item.items && item.items.length > 0) {
            toValues = toValues.concat(extractToValues(item.items));
        }
        if (item.to) {
            toValues.push(item.to);
        }
    });
    return toValues;
};
    export function extractRouteList(items) {
    let routeList = [];
    items.forEach((item) => {
        if (item.items && item.items.length > 0) {
          routeList = routeList.concat(extractRouteList(item.items));
        }
        if (item.to) {
          routeList.push(item);
        }
    });
    return routeList;
};
export function removeEmptyItems(menu) {
  return menu
      .map(item => {
          let newItem = { ...item };

          // Recursively filter the sub-items
          if (newItem.items) {
              newItem.items = removeEmptyItems(newItem.items);

              // Delete the items property if it's an empty array
              if (newItem.items.length === 0) {
                  delete newItem.items;
              }
          }

          // Return the new item if it has a 'to' property or non-empty 'items'
          return newItem.items && newItem.items.length > 0 || newItem.to ? newItem : null;
      })
      .filter(item => item !== null);
}