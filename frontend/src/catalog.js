export function isValidName(name) {
  return name.trim().length > 0;
}

export function getCategoryName(categories, categoryId) {
  return categories.find((category) => category.id === Number(categoryId))?.nombre ?? "";
}
