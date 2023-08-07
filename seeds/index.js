
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
// const { captureRejectionSymbol } = require('events');

mongoose.connect('mongodb+srv://bpatidar754:1236@cluster0.hqmetii.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    // useCreateIndex:true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100) + 10;
        // console.log(cities[random1000].longitude);
        const ca = [100,100];
        // console.log(typeof(coordinates));
        // console.log(arr);
        const camp = new Campground({

            author: '64ba909432bee6b2a26398aa',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur ipsa, dolor neque ab similique nemo eius molestiae? Optio laborum repudiandae odit reprehenderit possimus voluptate eum aspernatur quidem vero, quaerat aliquam.',
            price,
            geometry:{
                type: 'Point',
                // coordinates,
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dhaos2khd/image/upload/v1690025615/yelpCamp/ja7hzpcwoat6lb0n8agg.jpg',
                    filename: 'yelpCamp/ja7hzpcwoat6lb0n8agg',
                }

            ]

        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})