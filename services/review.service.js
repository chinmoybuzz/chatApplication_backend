const UserModel = require("../modal/User.model"); // Make sure this model exists and is exported
const { createResponse } = require("../utils/response");
const {convertFieldsToAggregateObject,aggregateFileConcat}=require("../helper/index")
const {statusSearch}=require("../helper/search");

exports.reviewList= async (params) => {
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

    const myAggregate = UserModel.aggregate([
      { $match: query },
        { $set: { "image.url": aggregateFileConcat("$image.url") } },
         { $project: {
         ...selectProjectParams, 
        } 
        },
        { $match: optionalQuery },
    ]);

    const result = await UserModel.aggregatePaginate(myAggregate, {
      offset: offset,
      limit: limit,
      sort: sortQuery,
    });

      return createResponse({
      status: 200,
      success: true,
      message: "User list fetched successfully",
      data: {
        list:result?.docs||[]
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return createResponse({
      status: 500,
      success: false,
      message: `Server Error: ${error.message}`
    });
  }
};

exports.userAdd = async (params) => {
  console.log("Data from body:", params);
  try {
    const user =await new UserModel({
      ...params,
      ...dummy,
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

exports.userEdit=()=>{
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

exports.userListu=()=>{
     
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
exports.userDetails=()=>{

}
exports.userRemoves=()=>{

}
