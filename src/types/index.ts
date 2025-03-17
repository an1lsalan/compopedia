// src/types/component.ts
export type Component = {
    id: string;
    title: string;
    description: string;
    userId: string;
    user: User;
    categoryId: string;
    category: Category;
    textBlocks: TextBlock[];
    images: Image[];
    createdAt: Date;
    updatedAt: Date;
};

export type ComponentFormData = {
    title: string;
    description: string;
    categoryId: string;
    categoryName?: string; // For creating a new category
    textBlocks: { content: string }[];
    images: File[];
};

// src/types/user.ts
export type User = {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    components?: Component[];
};

export type LoginFormData = {
    email: string;
    password: string;
};

export type RegisterFormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

// src/types/category.ts
export type Category = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    components?: Component[];
};

// src/types/textblock.ts
export type TextBlock = {
    blockType: string;
    headline: string;
    id: string;
    content: string;
    componentId: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
};

// src/types/image.ts
export type Image = {
    id: string;
    url: string;
    componentId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type UpdateUserData = {
    name: string;
    email: string;
    password?: string; // Optional, da es nur unter bestimmten Bedingungen gesetzt wird
};
