const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//Schema and Model using Mongoose
const TourSchema = new mongoose.Schema(
    //SCHEMA DEFINITION
    {
        name: {
            type: String,
            unique: true,
            required: [true, 'A tour must have a name'],
            trim: true,
            maxLength: [128, 'A tour name cannot have longer than 128 characters'],
            minLength: [8, 'A tour name must have atleast 8 characters'],
            //validate: [validator.isAlpha, 'Tour name should only contain alphabet characters']
            //validate: [validator.function, 'Message']
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a max group size']
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Average rating must be atleast 1'],
            max: [5, 'Average rating can be at max 5']
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price:{
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount:{
            type: Number,
            validate: { 
                validator: function(val){
                //does not work for updates (PATCH). this keyword does not point to a doc
                //during an update, in contrast to create
                return this.price > val
                },
                message: 'PriceDiscount ({VALUE}) should be less than the Price'
            }
        },
        difficulty:{
            type: String,
            default: "medium",
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty can be easy, medium or difficult. Nothing else'
            }
        },
        summary: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            required: [true, 'A tour must have a description']
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a image cover']
        },
        images: {
            type: [String]
        },
        createAt: {
            type: Date,
            default: Date.now()
        },
        startDates: {
            type: [Date]
        },
        secretTour: { 
            type: Boolean,
            default: false
        },
        //SLUGs
        slug: String
    },
    //OPTIONS 
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
    
);


//VIRTUAL PROPERTIES: Cannot be used for queriying.
TourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
});

//MONGOOSE DOCUMENT MIDDLEWARE

//pre-save-hook
TourSchema.pre('save', function(next){
    //This fun() runs before save and create. The this pointer holds current document
    //console.log(this);
    this.slug = slugify(this.name, {lower: true});
    next();
});
//multiple pre-saave-hooks possible
TourSchema.pre('save', function(next){
    //console.log(`Will try to save the Tour named: ${this.name}`);
    next();
});
//post-save-hook
TourSchema.post('save', function(doc, next){
    //post here implies 'After' save. Not a HTTP POST
    //fun() will have access to the doc that is newly created in db
    //no longer has access to 'this'
    //console.log(doc);    

    next();
});

//query middleware 'find'
TourSchema.pre(/^find/, function(next){
//TourSchema.pre('find', function(next){
// --> works only for find but not for findByID or findOne
//Replacing it with a regEx /^find/ --> matches all that start with 'find'
    //since this is a 'find', the big difference from 'save' is that:
    //this keyword points to the queryString and not the document

    //example usecase: "secret Tours for vips"
    this.find({secretTour: {$ne: true}});

    //record current time to measure query run time
    this.queryStartTime = Date.now();
    next();
});

TourSchema.post(/^find/, function(docs, next){
    console.log(`Query took: ${Date.now() - this.queryStartTime} milli sec`);
    next();
});

//aggregation middleware
TourSchema.pre('aggregate', function(next){
    //this points to aggreation object. match, group, sort,...
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
    //console.log(this.pipeline());
    next();
});

const TourModel = mongoose.model('tours', TourSchema);

module.exports = TourModel;