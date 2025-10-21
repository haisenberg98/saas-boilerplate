export interface BrewRecommendation {
    method: string;
    coffeeAmount: string;
    waterAmount: string;
    temperature: string;
    brewTime: string;
    grindSize: string;
    steps: string[];
    equipmentSuggestion?: {
        name: string;
        price: string;
        reason: string;
    };
}

export interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export interface SelectionState {
    beanType: string;
    timeAvailable: string;
    equipment: string;
    servings: string;
}