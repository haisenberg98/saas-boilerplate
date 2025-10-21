import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required and must be a string' }, { status: 400 });
        }

        // Check if OpenAI is available
        if (!process.env.OPENAI_API_KEY) {
            // Fallback to rule-based responses for common queries
            const fallbackResponse = getFallbackResponse(query);

            return NextResponse.json({
                response: fallbackResponse,
                fallback: true
            });
        }

        // For now, let's use a simple rule-based system until OpenAI is set up
        const aiResponse = await generateCoffeeAdvice(query);

        return NextResponse.json({
            response: aiResponse,
            fallback: false
        });
    } catch (error) {
        console.error('Coffee AI API Error:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Rule-based fallback for common coffee questions
function getFallbackResponse(query: string): string {
    const lowerQuery = query.toLowerCase();

    // Bitter coffee troubleshooting
    if (lowerQuery.includes('bitter')) {
        return `🤖 Your coffee tastes bitter? Here are the most common fixes:

**1. Grind Size:** Use a coarser grind to reduce over-extraction
**2. Water Temperature:** Lower to 85-90°C (avoid boiling water)
**3. Brew Time:** Reduce steeping/brew time by 30 seconds
**4. Coffee Ratio:** Use less coffee (try 1:16 ratio instead of 1:15)

**Quick Test:** If you're using a French Press, try pressing 30 seconds earlier. For pour-over, grind coarser and pour faster.

Try adjusting these parameters and taste the difference! ☕`;
    }

    // Sour coffee troubleshooting
    if (lowerQuery.includes('sour') || lowerQuery.includes('weak')) {
        return `🤖 Sour or weak coffee? This means under-extraction:

**1. Grind Finer:** Increase surface area for better extraction
**2. Hotter Water:** Use 92-96°C for better extraction
**3. More Time:** Extend brew time by 30 seconds
**4. More Coffee:** Try 1:15 ratio instead of 1:16

**Pro Tip:** Light roasts need hotter water and finer grinds than dark roasts.

Getting the grind size right is the key to better extraction! 🎯`;
    }

    // Camping/travel coffee
    if (lowerQuery.includes('camp') || lowerQuery.includes('travel') || lowerQuery.includes('portable')) {
        return `🤖 Perfect coffee for adventures! Here's my camping setup:

**Best Portable Method:** AeroPress
- Lightweight & virtually unbreakable
- Consistent results anywhere
- Easy cleanup

**Camping Recipe:**
- 18g coffee (medium-fine grind)
- 250ml water at ~85°C
- 2 minute brew time
- Press slowly for 30 seconds

**Pro Camping Tips:**
- Pre-grind beans at home
- Bring a small scale if possible
- Use a thermal mug to keep it hot

Happy brewing on your adventures! 🏕️`;
    }

    // Equipment recommendations
    if (lowerQuery.includes('grinder') || lowerQuery.includes('equipment') || lowerQuery.includes('buy')) {
        return `🤖 Choosing coffee equipment? Here's my hierarchy:

**Most Important First:**
1. **Good Grinder** - Makes 70% of the difference
2. **Brewing Method** - Matches your taste & lifestyle  
3. **Scale** - Consistency is key
4. **Quality Beans** - Fresh roasted within 2 weeks

**For Beginners:**
- French Press + Burr Grinder ($80-120 total)
- Simple, forgiving, great coffee

**For Coffee Geeks:**
- V60 + Premium Grinder ($150-250)
- More control, brighter flavors

What's your budget and taste preference? I can help you choose the right brewing method! 💰`;
    }

    // Altitude/Mountain brewing
    if (lowerQuery.includes('altitude') || lowerQuery.includes('mountain') || lowerQuery.includes('high elevation')) {
        return `🤖 High altitude brewing adjustments! 🏔️

**Altitude Effects (1000m+):**
- Water boils at lower temperatures (93-95°C)
- Lower atmospheric pressure affects extraction
- Faster evaporation and cooling

**Brewing Adjustments:**
- Use slightly more coffee to compensate
- Extend brew time by 10-20%
- Grind slightly finer than usual
- Consider insulated brewing vessels

**Pro Tips:**
- Portable equipment is perfect for mountain adventures
- Bring extra coffee for stronger brews
- Pre-heat equipment to maintain temperature

Perfect for hiking and mountain camping! 🥾`;
    }

    // Default response
    return `🤖 Great coffee question! While I'd love to give you a detailed answer, I'm currently running in basic mode.

**Quick Coffee Tips:**
- **Golden Ratio:** 1g coffee to 15-16g water
- **Grind Fresh:** Within 15 minutes of brewing
- **Water Temp:** 85-95°C depending on roast
- **Timing:** 2-6 minutes depending on method

**For Complex Questions:** Try asking about specific problems like "bitter coffee" or "weak extraction" - I have detailed help for those!

**Need Equipment?** Research different brewing methods to find what works best for you! ☕

What specific coffee challenge are you facing?`;
}

// Enhanced AI response using OpenAI
async function generateCoffeeAdvice(query: string): Promise<string> {
    try {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using the more cost-effective model
            messages: [
                {
                    role: "system",
                    content: `You are a coffee brewing expert for Kofe, a coffee equipment company. 
                    
                    Your knowledge:
                    - Coffee brewing techniques and troubleshooting
                    - Equipment recommendations from Kofe's catalog
                    - Global coffee culture and brewing conditions
                    - Outdoor/camping coffee brewing worldwide
                    - Specialty coffee terminology and methods
                    
                    Your personality:
                    - Friendly and enthusiastic about coffee
                    - Practical and helpful
                    - Focus on brewing technique and general equipment advice
                    - Use coffee emojis appropriately
                    - Professional but approachable
                    - Globally relevant and inclusive
                    
                    Response guidelines:
                    - Keep responses under 250 words
                    - Use bullet points and **bold** formatting for key points
                    - Include practical, actionable advice
                    - When relevant, discuss general equipment characteristics
                    - Always end with an encouraging coffee emoji
                    - Format with markdown for better readability
                    - Provide advice that works globally, not region-specific`
                },
                {
                    role: "user",
                    content: query
                }
            ],
            max_tokens: 400,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (!aiResponse) {
            throw new Error('No response from OpenAI');
        }

        return aiResponse;
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Fallback to rule-based response if OpenAI fails
        return getFallbackResponse(query);
    }
}
