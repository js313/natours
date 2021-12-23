class ApiFeatures {
    constructor(query, reqQuery) {
        this.query = query
        this.reqQuery = reqQuery
    }

    filter() {
        //FILTERING(ONLY EQUALS)
        const queryObj = { ...this.reqQuery }    //deep copy
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        //FILTERING(WITH INEQUALITIES)
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
        this.query = this.query.find(JSON.parse(queryStr))   //This returns a query object(not a promise), which we can chain multiple queries to, later
        return this.query
    }

    sort() {
        if(this.reqQuery.sort) {
            this.query = this.query.sort(this.reqQuery.sort.split(',').join(' '))
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this.query
    }

    select() {
        if(this.reqQuery.fields) {
            const fields = this.reqQuery.fields.replaceAll(',', ' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }
        return this.query
    }

    paginate() {
        if(this.reqQuery.page && this.reqQuery.limit) {
            const page = this.reqQuery.page * 1 || 1
            const limit = this.reqQuery.limit * 1 || 50
            const skip = (page - 1) * limit
            this.query = this.query.skip(skip).limit(limit)
        }
        return this.query
    }
}

module.exports = ApiFeatures