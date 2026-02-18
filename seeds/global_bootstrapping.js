if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const User = require('../models/user');

const dbUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const users = [
    { username: 'admin_global', email: 'admin@global.com', password: 'password123' },
    { username: 'camper_world', email: 'camper@world.com', password: 'password123' },
    { username: 'travel_guide', email: 'guide@travel.com', password: 'password123' }
];

const locations = [
    { city: 'Tokyo', state: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { city: 'London', state: 'UK', latitude: 51.5074, longitude: -0.1278 },
    { city: 'Paris', state: 'France', latitude: 48.8566, longitude: 2.3522 },
    { city: 'Sydney', state: 'Australia', latitude: -33.8688, longitude: 151.2093 },
    { city: 'Cairo', state: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
    { city: 'Rio de Janeiro', state: 'Brazil', latitude: -22.9068, longitude: -43.1729 },
    { city: 'New York', state: 'USA', latitude: 40.7128, longitude: -74.0060 }
];

const seedDB = async () => {
    // Clear existing campgrounds
    await Campground.deleteMany({});
    console.log("Campgrounds cleared");

    // Clear existing users to ensure clean slate for these specific dummy users
    // Only deleting the dummy users if they exist would be better, but for this task, 
    // let's just try to register them. If they exist, we'll use them.
    
    let registeredUsers = [];
    
    for (const userData of users) {
        const { username, email, password } = userData;
        try {
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            registeredUsers.push(registeredUser);
            console.log(`Registered user: ${username}`);
        } catch (e) {
            console.log(`User ${username} might already exist or error: ${e.message}`);
            // Attempt to find the user if registration failed
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                registeredUsers.push(existingUser);
                console.log(`Found existing user: ${username}`);
            }
        }
    }

    if (registeredUsers.length === 0) {
        console.log("No users available to assign to campgrounds.");
        return;
    }

    for (const loc of locations) {
        const randomUser = registeredUsers[Math.floor(Math.random() * registeredUsers.length)];
        const camp = new Campground({
            author: randomUser._id,
            location: `${loc.city}, ${loc.state}`,
            title: `${loc.city} Bootcamp`,
            description: `Experience the best camping in ${loc.city}.`,
            price: Math.floor(Math.random() * 20) + 10,
            geometry: {
                type: 'Point',
                coordinates: [loc.longitude, loc.latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dhaos2khd/image/upload/v1690025615/yelpCamp/ja7hzpcwoat6lb0n8agg.jpg',
                    filename: 'yelpCamp/ja7hzpcwoat6lb0n8agg',
                }
            ]
        });
        await camp.save();
        console.log(`Created campground in ${loc.city}`);
    }
};

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Database connection closed");
});
