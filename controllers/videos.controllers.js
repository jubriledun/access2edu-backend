import videoModel from "../model/videoModel.js";

export const addVideo = async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    const error = new Error("Title and description are required");
    res.statusCode = 400;
    return next(error);
  }
};
