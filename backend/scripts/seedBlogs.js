import mongoose from 'mongoose';
import Blog from '../models/blog.model.js';
import dotenv from 'dotenv';

dotenv.config();

const blogArticles = [
    {
        title: "First Trimester Nutrition: Essential Foods for Early Pregnancy",
        summary: "Discover the key nutrients and foods that support your baby's development during the crucial first 12 weeks of pregnancy.",
        content: `The first trimester is a critical period for your baby's development. During these initial 12 weeks, your baby's organs begin to form, making proper nutrition essential.

**Key Nutrients:**
- **Folic Acid**: Crucial for preventing neural tube defects. Found in leafy greens, citrus fruits, and fortified cereals.
- **Iron**: Supports increased blood volume. Include lean meats, beans, and spinach in your diet.
- **Calcium**: Essential for bone development. Dairy products, fortified plant milks, and leafy greens are excellent sources.

**Foods to Include:**
1. Leafy green vegetables (spinach, kale)
2. Citrus fruits (oranges, grapefruits)
3. Whole grains (oats, brown rice)
4. Lean proteins (chicken, fish, legumes)
5. Nuts and seeds

**Foods to Avoid:**
- Raw or undercooked meats
- High-mercury fish
- Unpasteurized dairy products
- Excessive caffeine

Remember to stay hydrated and eat small, frequent meals to manage morning sickness. Consult your healthcare provider for personalized nutrition advice.`,
        category: "nutrition",
        trimester: 1,
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Safe Exercise During Pregnancy: A Complete Guide",
        summary: "Learn about safe and effective exercises that can help you stay healthy and prepare your body for childbirth.",
        content: `Staying active during pregnancy offers numerous benefits, including improved mood, better sleep, and reduced pregnancy discomforts.

**Safe Exercises:**
1. **Walking**: Low-impact and perfect for all trimesters
2. **Swimming**: Excellent full-body workout with minimal joint stress
3. **Prenatal Yoga**: Improves flexibility and reduces stress
4. **Pilates**: Strengthens core muscles safely
5. **Stationary Cycling**: Safe alternative to outdoor biking

**Benefits:**
- Reduces back pain
- Improves sleep quality
- Boosts energy levels
- Prepares your body for labor
- Helps manage weight gain

**Exercises to Avoid:**
- Contact sports
- Activities with high fall risk
- Scuba diving
- Hot yoga or excessive heat exposure
- Exercises lying flat on your back (after first trimester)

**Important Guidelines:**
- Always warm up and cool down
- Stay hydrated
- Listen to your body
- Avoid overheating
- Consult your doctor before starting any new exercise routine

Aim for at least 150 minutes of moderate-intensity exercise per week, spread across several days.`,
        category: "exercise",
        trimester: null,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Managing Morning Sickness: Natural Remedies and Tips",
        summary: "Practical strategies to help you cope with nausea and vomiting during early pregnancy.",
        content: `Morning sickness affects up to 80% of pregnant women, typically occurring during the first trimester. While it can be challenging, there are many natural ways to manage it.

**Natural Remedies:**
1. **Ginger**: Consume ginger tea, ginger candies, or ginger ale
2. **Peppermint**: Sip peppermint tea or use essential oils
3. **Lemon**: Smell fresh lemon or add lemon to water
4. **Acupressure**: Try wristbands designed for motion sickness
5. **Small, Frequent Meals**: Eat every 2-3 hours to avoid empty stomach

**Dietary Tips:**
- Eat bland foods (crackers, toast, rice)
- Avoid spicy or greasy foods
- Stay hydrated with small sips throughout the day
- Try cold foods if hot foods trigger nausea
- Keep snacks by your bedside for morning

**Lifestyle Changes:**
- Get plenty of rest
- Avoid strong odors
- Open windows for fresh air
- Practice deep breathing exercises
- Consider vitamin B6 supplements (with doctor's approval)

**When to Seek Help:**
Contact your healthcare provider if you experience:
- Severe vomiting (more than 3-4 times per day)
- Inability to keep fluids down
- Weight loss
- Signs of dehydration

Remember, morning sickness usually improves by the second trimester. Be patient with yourself and don't hesitate to ask for support.`,
        category: "health",
        trimester: 1,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Second Trimester: Your Energy Returns",
        summary: "The second trimester brings relief from early pregnancy symptoms and new energy. Here's what to expect.",
        content: `Welcome to the "honeymoon period" of pregnancy! The second trimester (weeks 13-27) is often the most comfortable phase.

**What to Expect:**
- Increased energy levels
- Reduced morning sickness
- Baby's first movements (quickening)
- Growing baby bump
- Improved mood

**Physical Changes:**
Your baby is growing rapidly, and you'll notice:
- Your bump becoming more visible
- Baby movements starting around weeks 18-22
- Possible skin changes (glow, stretch marks)
- Hair and nail growth
- Backaches as your center of gravity shifts

**Health Checkups:**
- Monthly prenatal visits
- Anatomy scan (around week 20)
- Glucose screening test
- Blood pressure monitoring
- Weight tracking

**Self-Care Tips:**
1. Continue regular exercise
2. Maintain a balanced diet
3. Stay hydrated
4. Get adequate sleep
5. Practice good posture
6. Start wearing comfortable maternity clothes

**Important Milestones:**
- Week 18-22: Feel baby's first kicks
- Week 20: Anatomy scan reveals baby's development
- Week 24: Viability milestone reached

This is a great time to prepare for baby's arrival, attend prenatal classes, and enjoy this special phase of your pregnancy journey.`,
        category: "health",
        trimester: 2,
        image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Prenatal Vitamins: What You Need to Know",
        summary: "Understanding the importance of prenatal vitamins and which nutrients are essential for a healthy pregnancy.",
        content: `Prenatal vitamins are specially formulated supplements designed to support your health and your baby's development during pregnancy.

**Essential Nutrients:**
1. **Folic Acid (400-800 mcg)**: Prevents neural tube defects
2. **Iron (27 mg)**: Prevents anemia and supports blood production
3. **Calcium (1000 mg)**: Builds baby's bones and teeth
4. **Vitamin D (600 IU)**: Aids calcium absorption
5. **DHA (200-300 mg)**: Supports brain and eye development
6. **Iodine (220 mcg)**: Important for thyroid function

**When to Start:**
- Ideally, start taking prenatal vitamins before conception
- If already pregnant, start immediately
- Continue throughout pregnancy and breastfeeding

**Choosing the Right Prenatal Vitamin:**
- Look for ones with adequate folic acid
- Check iron content (some women need extra)
- Consider DHA supplements separately if needed
- Choose a form that doesn't cause nausea
- Consult your healthcare provider for recommendations

**Tips for Taking:**
- Take with food to reduce nausea
- Take at the same time daily
- Don't double up on vitamins
- Store properly away from heat and moisture

**Food Sources:**
While supplements are important, also focus on nutrient-rich foods:
- Dark leafy greens (folate)
- Lean meats and beans (iron)
- Dairy products (calcium)
- Fatty fish (DHA)
- Fortified foods

Remember, prenatal vitamins complement a healthy diet but don't replace it. Always discuss supplements with your healthcare provider.`,
        category: "nutrition",
        trimester: null,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Preparing for Labor: What to Pack in Your Hospital Bag",
        summary: "A comprehensive checklist of essential items to pack for your hospital stay during delivery.",
        content: `Packing your hospital bag around week 36 ensures you're ready when labor begins. Here's what to include:

**For You:**
- Comfortable nightgowns or pajamas (front-opening for breastfeeding)
- Non-slip socks or slippers
- Robe
- Comfortable going-home outfit
- Maternity bras and nursing bras
- Underwear (disposable or old pairs)
- Toiletries (toothbrush, shampoo, lip balm)
- Hair ties and headband
- Phone charger and power bank
- Insurance cards and hospital forms
- Birth plan (if you have one)

**For Baby:**
- Newborn-sized going-home outfit
- Receiving blanket
- Car seat (installed in car)
- Baby hat and socks
- Diapers and wipes (hospital provides, but good to have extras)

**Comfort Items:**
- Pillow from home
- Favorite snacks
- Water bottle
- Music playlist or speaker
- Books or magazines
- Essential oils (if allowed)

**For Your Partner:**
- Change of clothes
- Snacks
- Phone charger
- Camera or phone for photos
- Comfortable shoes

**Important Documents:**
- ID and insurance cards
- Hospital registration forms
- Birth plan
- List of emergency contacts
- Pediatrician information

**Pro Tips:**
- Pack two separate bags: one for labor and one for postpartum
- Label everything clearly
- Keep bag easily accessible
- Don't overpack - hospitals provide many essentials

Remember, every hospital is different, so check with yours about what they provide. Pack around week 36 to be prepared!`,
        category: "general",
        trimester: 3,
        image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Third Trimester: Final Preparations",
        summary: "Navigate the final weeks of pregnancy with confidence as you prepare for your baby's arrival.",
        content: `The third trimester (weeks 28-40) is the final stretch of your pregnancy journey. Here's how to prepare:

**Physical Changes:**
- Larger baby bump
- More frequent baby movements
- Shortness of breath
- Swelling in feet and ankles
- Backaches and pelvic pressure
- Braxton Hicks contractions
- Difficulty sleeping

**Weekly Checkups:**
Starting at week 36, you'll have weekly visits to monitor:
- Baby's position
- Cervical changes
- Blood pressure
- Baby's heart rate
- Your weight

**Preparing for Baby:**
1. **Nursery Setup**: Prepare baby's sleeping space
2. **Baby Gear**: Install car seat, set up stroller
3. **Clothing**: Wash baby clothes and organize by size
4. **Feeding**: Decide on breastfeeding or formula, gather supplies
5. **Support System**: Arrange help for first few weeks

**Self-Care:**
- Rest as much as possible
- Stay hydrated
- Continue gentle exercise (walking, swimming)
- Practice relaxation techniques
- Eat small, frequent meals
- Elevate feet to reduce swelling

**Signs of Labor:**
Watch for:
- Regular contractions
- Water breaking
- Bloody show
- Back pain that comes and goes

**When to Call Your Doctor:**
- Contractions every 5 minutes
- Water breaking
- Decreased fetal movement
- Severe headaches or vision changes
- Severe abdominal pain

**Final Weeks Checklist:**
- ✓ Hospital bag packed
- ✓ Car seat installed
- ✓ Pediatrician chosen
- ✓ Maternity leave arranged
- ✓ Support person identified
- ✓ Birth plan discussed

You're almost there! Take time to rest and prepare mentally for this incredible journey ahead.`,
        category: "health",
        trimester: 3,
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Breastfeeding Basics: Getting Started",
        summary: "Essential information for new mothers about breastfeeding, including positioning, latching, and common challenges.",
        content: `Breastfeeding provides optimal nutrition for your baby and offers numerous health benefits for both of you.

**Benefits:**
- Perfect nutrition tailored to your baby
- Boosts baby's immune system
- Promotes bonding
- Helps uterus return to normal size
- Reduces risk of certain cancers
- Convenient and cost-effective

**Getting Started:**
- Start within first hour after birth if possible
- Skin-to-skin contact helps
- Let baby lead - feed on demand
- Watch for hunger cues (rooting, hand-to-mouth)
- Aim for 8-12 feeds per 24 hours initially

**Proper Positioning:**
1. **Cradle Hold**: Baby's head in crook of your arm
2. **Cross-Cradle**: Support baby's head with opposite hand
3. **Football Hold**: Baby under your arm like a football
4. **Side-Lying**: Both you and baby lying on your sides

**Latching Tips:**
- Baby's mouth should cover most of areola
- Nose should be close to breast
- Chin should touch breast
- Lips should be flanged outward
- You should hear swallowing, not clicking

**Common Challenges:**
- **Sore Nipples**: Ensure proper latch, use lanolin cream
- **Engorgement**: Frequent feeding, warm compresses
- **Low Supply**: Nurse frequently, stay hydrated, rest
- **Mastitis**: See doctor immediately if you have flu-like symptoms

**Feeding Schedule:**
- Newborns: Every 2-3 hours (8-12 times daily)
- By 2 months: Every 3-4 hours
- Let baby determine when they're full
- Watch for wet diapers (6+ per day after first week)

**Nutrition for You:**
- Eat extra 300-500 calories daily
- Stay well-hydrated
- Continue prenatal vitamins
- Avoid alcohol and limit caffeine
- Eat balanced, nutritious meals

**When to Seek Help:**
- Persistent pain
- Baby not gaining weight
- Concerns about supply
- Signs of infection

Remember, breastfeeding is a learned skill for both you and baby. Be patient, seek support, and don't hesitate to ask for help from lactation consultants or support groups.`,
        category: "health",
        trimester: null,
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Postpartum Recovery: Caring for Yourself After Birth",
        summary: "Essential guidance for physical and emotional recovery in the weeks following childbirth.",
        content: `Postpartum recovery is a crucial period that requires patience and self-care. Your body needs time to heal.

**Physical Recovery:**
- **Vaginal Delivery**: Soreness, bleeding (lochia), perineal discomfort
- **Cesarean**: Incision care, limited activity, pain management
- Both: Uterine contractions, breast changes, fatigue

**First Week:**
- Rest as much as possible
- Accept help from family and friends
- Stay hydrated and eat nutritious meals
- Use ice packs for perineal swelling
- Take pain medication as prescribed
- Practice gentle pelvic floor exercises

**Emotional Changes:**
- "Baby blues" are common (days 3-5)
- Mood swings and tearfulness
- Overwhelming feelings
- Sleep deprivation effects

**Warning Signs:**
Contact your doctor if you experience:
- Heavy bleeding (soaking pad in 1 hour)
- Fever over 100.4°F
- Severe abdominal pain
- Signs of infection
- Persistent sadness or anxiety
- Thoughts of harming yourself or baby

**Self-Care Tips:**
1. **Rest**: Sleep when baby sleeps
2. **Nutrition**: Eat regular, balanced meals
3. **Hydration**: Drink plenty of water
4. **Gentle Movement**: Short walks when ready
5. **Support**: Don't isolate yourself
6. **Realistic Expectations**: You don't need to do everything

**Recovery Timeline:**
- **Weeks 1-2**: Focus on rest and healing
- **Weeks 3-4**: Gradual return to light activities
- **Weeks 5-6**: Check-up with healthcare provider
- **Months 2-3**: Most physical recovery complete

**When to Resume Activities:**
- **Exercise**: Start with walking, wait 6 weeks for intense exercise
- **Driving**: Usually OK after 1-2 weeks (check with doctor)
- **Sex**: Wait until cleared by doctor (usually 6 weeks)
- **Work**: Depends on delivery type and job demands

**Mental Health:**
- Postpartum depression affects 1 in 7 women
- Seek help if symptoms persist beyond 2 weeks
- Support groups and therapy can help
- Medication is safe while breastfeeding (with doctor's guidance)

Remember, recovery takes time. Be kind to yourself and prioritize your well-being alongside caring for your baby.`,
        category: "health",
        trimester: null,
        image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Understanding Baby's Development: Week by Week",
        summary: "Track your baby's growth and development throughout your pregnancy journey.",
        content: `Understanding your baby's development helps you connect with your pregnancy and make informed decisions.

**First Trimester (Weeks 1-12):**
- **Week 4**: Neural tube begins forming
- **Week 6**: Heart starts beating
- **Week 8**: All major organs begin forming
- **Week 10**: Baby is now a fetus
- **Week 12**: Baby can make movements

**Second Trimester (Weeks 13-27):**
- **Week 14**: Baby can suck thumb
- **Week 16**: Baby can hear sounds
- **Week 20**: Halfway point, anatomy scan
- **Week 24**: Viability milestone
- **Week 27**: Baby can open and close eyes

**Third Trimester (Weeks 28-40):**
- **Week 28**: Baby can blink and has eyelashes
- **Week 32**: Baby practices breathing
- **Week 36**: Baby gains weight rapidly
- **Week 37**: Considered full-term
- **Week 40**: Due date arrives

**Key Milestones:**
- **Week 8**: All organs present
- **Week 12**: Risk of miscarriage decreases significantly
- **Week 20**: Gender can often be determined
- **Week 24**: Baby could survive outside womb with medical help
- **Week 37**: Baby is full-term

**What Affects Development:**
- Maternal nutrition
- Avoiding harmful substances
- Regular prenatal care
- Managing stress
- Adequate rest

**Monitoring Development:**
- Regular ultrasounds
- Measuring fundal height
- Listening to fetal heart rate
- Tracking movements
- Blood tests and screenings

**When to Be Concerned:**
Contact your healthcare provider if:
- Decreased fetal movement
- No movement felt by week 24
- Severe cramping or bleeding
- Signs of preterm labor

Every pregnancy is unique. Trust your instincts and maintain regular prenatal care for the best outcomes.`,
        category: "general",
        trimester: null,
        image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800"
    }
];

const seedBlogs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pregnancy-care');
        console.log('Connected to MongoDB');

        // Clear existing blogs (optional - remove if you want to keep existing)
        await Blog.deleteMany({});
        console.log('Cleared existing blogs');

        // Insert new blogs
        const insertedBlogs = await Blog.insertMany(blogArticles);
        console.log(`Successfully seeded ${insertedBlogs.length} blog articles`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding blogs:', error);
        process.exit(1);
    }
};

seedBlogs();
