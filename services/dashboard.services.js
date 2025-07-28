const UserModel = require("../modal/User.model"); 
const ProductModel=require("../modal/Product.model")
const { createResponse } = require("../utils/response");
const {convertFieldsToAggregateObject,aggregateFileConcat}=require("../helper/index")
const {statusSearch}=require("../helper/search");

exports.dashboard= async (params) => {
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
    // if (gender) query.gender = gender;
    // if (username) query.username = username;
    // if (dateOfBirth) query.dateOfBirth = dateOfBirth;
    // if (lastName) query.fullname["lastName"] = lastName;
    // if (firstName) query.fullname["firstName"] = firstName;
    if (emailVerified) query.emailVerified = statusSearch(emailVerified);
    // if (isFeatured) query.isFeatured = parseInt(isFeatured);

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