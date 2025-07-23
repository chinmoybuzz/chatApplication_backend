const ProductModel = require("../modal/Product.model"); // Make sure this model exists and is exported
const { createResponse } = require("../utils/response");
const {convertFieldsToAggregateObject,aggregateFileConcat}=require("../helper/index")
const {statusSearch}=require("../helper/search");

exports.ProductList= async (params) => {
    try {
    const {
      _id = "",
      status,
      keyword,
      rating,
      offset = 0,
      limit = 10,
      emailVerified,
      searchValue = "",
      selectValue = "name,email,status",
      sortQuery = "-createdAt",
    } = params;

    const select = selectValue && selectValue.replaceAll(",", " ");
    let selectProjectParams = convertFieldsToAggregateObject(select, " ");

    let query = { deletedAt: null };
    let optionalQuery = { deleteAt: null };

    if (rating) optionalQuery.rating = { $gte: parseInt(params.rating) };

    if (status) query.status = statusSearch(status);
 
    if (emailVerified) query.emailVerified = statusSearch(emailVerified);

    if (Array.isArray(_id) && _id.length > 0) {
      let ids = _id.map((el) => new ObjectId(el));
      query["_id"] = { $in: ids };
    } else if (_id) query["_id"] = new ObjectId(_id);

    if (keyword) {
      const searchQuery = searchValue ? searchValue.split(",") : select.split(" ");
      optionalQuery.$or = search(searchQuery, keyword);
      if (keyword.includes(" ")) {
        optionalQuery.$or.push({
          $and: [
            { "name": { $regex: keyword.split(" ")[0], $options: "i" } },
          ],
        });
      }
    }

    const myAggregate = ProductModel.aggregate([
      { $match: query },
    //   {
    //     $lookup: {
    //       from: "reviews",
    //       let: { user: "$_id" },
    //       pipeline: [
    //         { $match: { $expr: { $and: [{ $eq: ["$deletedAt", null] }, { $eq: ["$vendorId", "$$user"] }] } } },
    //         { $group: { _id: "$vendorId", averageRating: { $avg: "$rating" } } },
    //         { $project: { _id: 1, averageRating: 1 } },
    //       ],
    //       as: "review",
    //     },
    //   },
        { $set: { "image.url": aggregateFileConcat("$image.url") } },
         { $project: {
         ...selectProjectParams, 
        } 
        },
        { $match: optionalQuery },
    ]);

    const result = await ProductModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

      return createResponse({
      status: 200,
      success: true,
      message: "Product list fetched successfully",
      data: {
        list:result?.docs||[]
      }
    });

  } catch (error) {
    console.error("Product List Error:", error);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${error.message}`
    });
  }
};

exports.ProductAdd = async (params) => {
  console.log("Data from body:", params);
  try {
    const user =await new ProductModel({
      ...params,
       createdBy: params.authUser ? params.authUser._id : null,
    });

    const savedUser = await user.save();

    return createResponse({
      status: 201,
      success: true,
      message: "User created successfully",
      data: savedUser
    });
  } catch (err) {
    console.error("User Add Error:", err.message);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${err.message}`
    });
  }
};

exports.ProductEdit=()=>{
        params.user={
        _id:"123",
        email:"user@gmail.com",
        role:"admin"
    }
    try{



        return createResponse({
        status: 200,
        message: "User Updated",
        data: {
        user:{
          _id: user._id,
          email: user.email,
          role: user.role,
        }
        }
    });
    }catch(err){
        console.log("User Edit Error",err.msg)
        return createResponse({
        status: 500,
        success: false,
        message: `Server Error: ${err.msg}`
    });
    }

}

exports.ProductDetail=()=>{
     
    try{



        return createResponse({
        status: 201,
        message: "User List",
        data: {
        list:params.user
        }
    });
    }catch(err){
        console.log("User List Error",err.msg)
        return createResponse({
        status: 500,
        success: false,
        message: `Server Error: ${err.msg}`
    });
    }

}

exports.ProductRemoves=()=>{

}
