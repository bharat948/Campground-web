const Joi=require('joi');
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages:Joi.array()
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required(),
        body:Joi.string().required()
    }).required()
});

module.exports.replySchema = Joi.object({
    reply: Joi.object({
        body: Joi.string().required().trim().min(1).max(500)
    }).required()
});