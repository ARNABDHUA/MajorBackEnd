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
    const { course_id,course_name, days,sem } = req.body;

    if (!course_id ||! course_name || !days?.day1 || !days?.day2) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(days.day1.length);
    const exist = await CourseRoutine.findOne({ course_id });

    const updateData = {
      course_id,
      course_name,
      sem,
      days,
    };

    const updatedRoutine = await CourseRoutine.findOneAndUpdate(
      { course_id },      
      updateData,         
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


const addRoutinesNormal = async (req, res) => {
  try {
    const {
      course_id,
      course_name,
      sem,
      day,
      time,
      paper,
      paper_code
    } = req.body;

    if (!course_id || !course_name || !sem || !day || !time || !paper || !paper_code) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let courseRoutine = await CourseRoutine.findOne({
      course_id,
      course_name,
      sem
    });

    const dayKey = day.toLowerCase().replace(" ", "");

    let resMessage = "";

    
    if (!courseRoutine) {
      const newTimeSlot = {
        time,
        paper,
        paper_code
      };

      const newCourseRoutine = new CourseRoutine({
        course_id,
        course_name,
        sem,
        days: {
          day1: [],
          day2: [],
          day3: [],
          day4: [],
          day5: [],
          day6: []
        }
      });

      if (!newCourseRoutine.days.hasOwnProperty(dayKey)) {
        return res.status(400).json({ message: "Invalid day provided for new routine." });
      }

      newCourseRoutine.days[dayKey].push(newTimeSlot);

      const savedRoutine = await newCourseRoutine.save();

      return res.status(201).json({
        message: "New course routine created and time slot added.",
        data: savedRoutine
      });
    }

    
    if (!courseRoutine.days.hasOwnProperty(dayKey)) {
      return res.status(400).json({ message: "Invalid day provided." });
    }

    const timeSlots = courseRoutine.days[dayKey];
    const existingSlotIndex = timeSlots.findIndex(slot => slot.paper_code === paper_code);

    if (existingSlotIndex !== -1) {
     
      courseRoutine.days[dayKey][existingSlotIndex].time = time;

      resMessage = `Time updated for paper_code ${paper_code} on ${day}`;
    } else {
      
      const newTimeSlot = {
        time,
        paper,
        paper_code
      };

      courseRoutine.days[dayKey].push(newTimeSlot);

      resMessage = `New time slot added for ${day}`;
    }

    const updatedRoutine = await courseRoutine.save();

    res.status(200).json({
      message: resMessage,
      data: updatedRoutine
    });

  } catch (error) {
    console.error("Error adding or updating time slot:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



const deleteTimeSlot = async (req, res) => {
  try {
    const { course_id, course_name, sem, day, paper_code } = req.body;

    
    const courseRoutine = await CourseRoutine.findOne({
      course_id,
      course_name,
      sem
    });

    if (!courseRoutine) {
      return res.status(404).json({ message: "Course routine not found." });
    }

    
    const dayKey = day.toLowerCase().replace(" ", "");

    
    if (!courseRoutine.days.hasOwnProperty(dayKey)) {
      return res.status(400).json({ message: "Invalid day provided." });
    }

    
    const originalLength = courseRoutine.days[dayKey].length;

    courseRoutine.days[dayKey] = courseRoutine.days[dayKey].filter(
      slot => slot.paper_code !== paper_code
    );

    const updatedLength = courseRoutine.days[dayKey].length;

    if (originalLength === updatedLength) {
      return res.status(404).json({
        message: `No time slot found for paper_code ${paper_code} in ${day}`
      });
    }

    
    const updatedRoutine = await courseRoutine.save();

    res.status(200).json({
      message: `Time slot with paper_code ${paper_code} deleted from ${day}`,
      data: updatedRoutine
    });

  } catch (error) {
    console.error("Error deleting time slot:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateSlotDetails = async (req, res) => {
  try {
    const { course_id, sem, day, paper_code, date, is_live, topic, image } = req.body;

    const dayToWeekdayMap = {
      "Day 1": "Monday",
      "Day 2": "Tuesday",
      "Day 3": "Wednesday",
      "Day 4": "Thursday",
      "Day 5": "Friday",
      "Day 6": "Saturday"
    };

    if (!dayToWeekdayMap.hasOwnProperty(day)) {
      return res.status(400).json({ message: "Invalid day provided. Use Day 1 to Day 6." });
    }
    const today = new Date();
    const options = { weekday: 'long' };
    const currentDayName = today.toLocaleDateString('en-US', options);

    if (currentDayName !== dayToWeekdayMap[day]) {
      return res.status(400).json({
        message: `You can only update slots for ${day} (${dayToWeekdayMap[day]}) on ${dayToWeekdayMap[day]}. Today is ${currentDayName}.`
      });
    }

    const courseRoutine = await CourseRoutine.findOne({ course_id, sem });

    if (!courseRoutine) {
      return res.status(404).json({ message: "Course routine not found." });
    }

    // Convert "Day 1" → "day1"
    const dayKey = day.toLowerCase().replace(" ", "");

    if (!courseRoutine.days.hasOwnProperty(dayKey)) {
      return res.status(400).json({ message: "Invalid day provided in course routine days." });
    }

    const timeSlots = courseRoutine.days[dayKey];

    const slotIndex = timeSlots.findIndex(slot => slot.paper_code === paper_code);

    if (slotIndex === -1) {
      return res.status(404).json({
        message: `No time slot found for paper_code ${paper_code} on ${day}`
      });
    }

    if (date !== undefined) {
      courseRoutine.days[dayKey][slotIndex].date = date;
    }
    if (is_live !== undefined) {
      courseRoutine.days[dayKey][slotIndex].is_live = is_live;
    }
    if (topic !== undefined) {
      courseRoutine.days[dayKey][slotIndex].topic = topic;
    }
    if (image !== undefined) {
      courseRoutine.days[dayKey][slotIndex].image = image;
    }

    const updatedRoutine = await courseRoutine.save();

    res.status(200).json({
      message: `Time slot updated for paper_code ${paper_code} on ${day} (${dayToWeekdayMap[day]})`,
      data: updatedRoutine
    });

  } catch (error) {
    console.error("Error updating time slot details:", error);
    res.status(500).json({ message: "Server error", error });
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

module.exports = { getAllReotines, addRoutines, deleteRoutine,addRoutinesNormal ,deleteTimeSlot ,updateSlotDetails };
