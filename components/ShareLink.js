// Fonctions universelles à l'ensemble du code
export function shareLink(query) {
  event.stopPropagation();
  let linkToShare = `${url.origin}/france_services/${query}`;
  navigator.clipboard.writeText(linkToShare);
}
