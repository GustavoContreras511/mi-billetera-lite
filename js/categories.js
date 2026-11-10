export const CATEGORIES = ['Comida', 'Transporte', 'Servicios', 'Ocio', 'Otros'];

export const categoryColor = category => `var(--category-${CATEGORIES.indexOf(category) + 1})`;
