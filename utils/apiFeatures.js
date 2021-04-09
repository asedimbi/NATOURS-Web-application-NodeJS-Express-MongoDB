class APIFeatures{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        //A) Filtering key = value
        const queryObj = {...this.queryString};
        const excludeFields = ['page','sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        //B) Advanced Filtering. Key =, <, > , <=, >=, != value
        //{duration : {gte: 5}} --> host:port/api?duration[gte]=5
        //gt gte lt lte --> $gt $gte $lt $lte
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => '$'+match);

        this.query = this.query.find(JSON.parse(queryStr));
        //let query = Tours.find(JSON.parse(queryStr));

        return this;
    }

    sort(){
        //2) Sort
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else{
            //default sorting criteria
            // this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    project(){
        //3) Field Limiting
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            //exclude the key __v0
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate(){
        //4) Pagination
        const page = this.queryString.page*1 || 1;
        const limit = this.queryString.limit*1 || 100;
        console.log(limit);
        const skip = (page-1) * limit;
        
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;