const CourseRoutine = require("../models/routineModels");

const getAllReotines = async (req, res) => {
  const { course_id } = req.body;
  try {
    if (course_id) {
      const routines = await CourseRoutine.find({ course_id });
      res.status(200).json(routines);
    } else {
      const allRoutines = await CourseRoutine.find();
      res.status(200).json(allRoutines);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addRoutines = async (req, res) => {
  try {
    const { course_id, days } = req.body;

    if (!course_id || !days?.day1 || !days?.day2) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(days.day1);
    const exist = await CourseRoutine.findOne({ course_id });

    const updatedRoutine = await CourseRoutine.findOneAndUpdate(
      { course_id },
      { days },
      { new: true, upsert: true }
    );

    if (exist) {
      res.status(200).json({
        message: "Course routine updated successfully",
        data: updatedRoutine,
      });
    } else {
      res.status(200).json({
        message: "Course routine added successfully",
        data: updatedRoutine,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRoutine = async (req, res) => {
  try {
    const { course_id } = req.params;

    if (!course_id) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const deletedRoutine = await CourseRoutine.findOneAndDelete({ course_id });

    if (!deletedRoutine) {
      return res.status(404).json({ error: "Course routine not found" });
    }

    res.status(200).json({
      message: "Course routine deleted successfully",
      data: deletedRoutine,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllReotines, addRoutines, deleteRoutine };
