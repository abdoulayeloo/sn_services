export function preventDrag(div, map) {
  // Disable dragging when user's cursor enters the element
  div.getContainer().addEventListener("mouseover", function () {
    map.dragging.disable();
  });

  // Re-enable dragging when user's cursor leaves the element
  div.getContainer().addEventListener("mouseout", function () {
    map.dragging.enable();
  });
}
