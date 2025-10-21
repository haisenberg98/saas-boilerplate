import { BrewRecommendation, SelectionState } from './types';

export const getBrewRecommendation = (selections: SelectionState): BrewRecommendation => {
    const { beanType, timeAvailable, equipment, servings } = selections;

    if (equipment === 'aeropress') {
        const coffeeAmount = servings === '1' ? '15g' : '20g';
        const waterAmount = servings === '1' ? '240ml' : '320ml';
        const temperature = beanType === 'light' ? '92°C' : beanType === 'dark' ? '85°C' : '88°C';
        const brewTime = beanType === 'light' ? '2:45' : beanType === 'dark' ? '2:15' : '2:30';

        return {
            method: 'AeroPress',
            coffeeAmount,
            waterAmount,
            temperature,
            brewTime,
            grindSize: 'Medium-fine',
            steps: [
                'Heat water to the recommended temperature',
                `Grind ${coffeeAmount} beans to medium-fine consistency`,
                'Set AeroPress in inverted position',
                'Add coffee grounds and pour water slowly',
                'Stir gently for 10 seconds',
                'Steep for 1:30',
                'Flip and press slowly for 30 seconds'
            ]
        };
    }

    if (equipment === 'french-press') {
        const multiplier = servings === '1' ? 1 : servings === '2' ? 2 : 3;
        const temperature = beanType === 'light' ? '95°C' : beanType === 'dark' ? '90°C' : '92°C';
        const brewTime = beanType === 'light' ? '4:30' : beanType === 'dark' ? '3:30' : '4:00';

        return {
            method: 'French Press',
            coffeeAmount: `${30 * multiplier}g`,
            waterAmount: `${500 * multiplier}ml`,
            temperature,
            brewTime,
            grindSize: 'Coarse',
            steps: [
                'Heat water to the recommended temperature',
                `Grind ${30 * multiplier}g beans coarsely`,
                'Add coffee grounds to French Press',
                'Pour water slowly, saturating all grounds',
                'Stir once gently',
                'Place lid and steep for 4 minutes',
                'Press plunger down slowly and steadily'
            ]
        };
    }

    if (equipment === 'moka-pot') {
        const heatLevel = beanType === 'light' ? 'Medium-high heat' : beanType === 'dark' ? 'Medium-low heat' : 'Medium heat';
        const grindSize = beanType === 'light' ? 'Medium-fine' : beanType === 'dark' ? 'Medium' : 'Fine';
        const brewTime = beanType === 'light' ? '6:00' : beanType === 'dark' ? '4:00' : '5:00';
        
        return {
            method: 'Moka Pot',
            coffeeAmount: servings === '1' ? '18g' : '25g',
            waterAmount: 'Fill to safety valve',
            temperature: heatLevel,
            brewTime: brewTime,
            grindSize: grindSize,
            steps: [
                'Fill bottom chamber with water to safety valve',
                `Grind ${servings === '1' ? '18g' : '25g'} beans to ${grindSize.toLowerCase()} consistency`,
                "Fill filter basket with coffee, level but don't tamp",
                'Assemble moka pot',
                `Place on ${heatLevel.toLowerCase()}`,
                'When coffee starts flowing, reduce heat to low',
                'Remove from heat when gurgling starts'
            ]
        };
    }

    if (equipment === 'pour-over') {
        const temperature = beanType === 'light' ? '95°C' : beanType === 'dark' ? '88°C' : '91°C';
        const brewTime = beanType === 'light' ? '4:00' : beanType === 'dark' ? '3:00' : '3:30';
        const grindSize = beanType === 'light' ? 'Medium-fine' : beanType === 'dark' ? 'Medium' : 'Medium';

        return {
            method: 'Pour Over (V60)',
            coffeeAmount: servings === '1' ? '22g' : '30g',
            waterAmount: servings === '1' ? '350ml' : '500ml',
            temperature,
            brewTime,
            grindSize,
            steps: [
                'Heat water and rinse filter',
                `Grind ${servings === '1' ? '22g' : '30g'} beans to medium consistency`,
                'Add coffee to filter, create small well in center',
                'Start timer, pour 2x coffee weight in water (bloom)',
                'Wait 30 seconds',
                'Pour in slow, circular motions',
                'Finish pouring by 2:30, total brew time 3:30'
            ]
        };
    }

    // Default recommendation for "none" equipment
    const quickBrew = timeAvailable === 'quick';
    if (quickBrew) {
        const temperature = beanType === 'light' ? '92°C' : beanType === 'dark' ? '85°C' : '88°C';
        const brewTime = beanType === 'light' ? '2:45' : beanType === 'dark' ? '2:15' : '2:30';

        return {
            method: 'AeroPress',
            coffeeAmount: '15g',
            waterAmount: '240ml',
            temperature,
            brewTime,
            grindSize: 'Medium-fine',
            steps: [
                'Perfect for quick, clean coffee!',
                'Portable and great for travel',
                'Consistent results every time'
            ],
            equipmentSuggestion: {
                name: 'AeroPress Coffee Maker',
                price: '$65 NZD',
                reason: 'Perfect for your quick brewing needs!'
            }
        };
    } else {
        const temperature = beanType === 'light' ? '95°C' : beanType === 'dark' ? '90°C' : '92°C';
        const brewTime = beanType === 'light' ? '4:30' : beanType === 'dark' ? '3:30' : '4:00';

        return {
            method: 'French Press',
            coffeeAmount: '30g',
            waterAmount: '500ml',
            temperature,
            brewTime,
            grindSize: 'Coarse',
            steps: ['Full-bodied, rich coffee', 'Great for multiple cups', 'Simple and reliable method'],
            equipmentSuggestion: {
                name: 'French Press (1L)',
                price: '$45 NZD',
                reason: 'Ideal for your brewing style and serving size!'
            }
        };
    }
};

export const formatAIResponse = (content: string) => {
    return content
        .replace(/\n/g, '<br />')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^(\d+\.)\s/gm, '<br /><strong>$1</strong> ')
        .replace(/^-\s/gm, '<br />• ')
        .replace(/\*\*([^*]+):\*\*/g, '<br /><strong style="color: #dc3522;">$1:</strong>')
        .replace(/^(<br \/>)+/, '');
};