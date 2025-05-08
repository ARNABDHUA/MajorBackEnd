const CourseRoutine = require("../models/routineModels");
const Course = require("../models/courseModel");
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
      sem,
      day,
      time,
      paper,
      paper_code
    } = req.body;

    if (!course_id || !sem || !day || !time || !paper || !paper_code) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const dayKey = day.toLowerCase().replace(" ", "");
    let courseRoutine = await CourseRoutine.findOne({
      course_id,
      sem
    });

    let resMessage = "";

    // Time slot boundaries
    const earliestStartTime = parseTime("9:00 A.M");
    const latestEndTime = parseTime("7:00 P.M"); // Ending at 7:00 P.M (end time of last slot)

    const proposedStartTime = extractStartTime(time);
    const proposedEndTime = extractEndTime(time);

    // --- Validate: Time is within allowed day slot (9:00 A.M - 7:00 P.M) ---
    if (proposedStartTime < earliestStartTime || proposedEndTime > latestEndTime) {
      return res.status(400).json({
        message: `Time slot must be between 9:00 A.M and 7:00 P.M. Provided slot is from ${formatTime(proposedStartTime)} to ${formatTime(proposedEndTime)}.`
      });
    }

    // If no routine exists, create new
    if (!courseRoutine) {
      const newTimeSlot = { time, paper, paper_code };
      const newCourseRoutine = new CourseRoutine({
        course_id,
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

    // --- Validate: Check if time already exists ---
    const timeConflict = timeSlots.find(slot => slot.time === time);

    if (timeConflict) {
      return res.status(400).json({
        message: `Time slot '${time}' is already assigned to paper '${timeConflict.paper}' with code '${timeConflict.paper_code}'. Please choose a different time.`
      });
    }

    // --- Validate: Ensure proposed time starts after the latest slot ---
    const existingEndTimes = timeSlots.map(slot => extractEndTime(slot.time));

    const latestExistingEndTime = existingEndTimes.length
      ? existingEndTimes.reduce((a, b) => (a > b ? a : b))
      : earliestStartTime;

    if (proposedStartTime < latestExistingEndTime) {
      return res.status(400).json({
        message: `New time slot must start after the last slot ending at ${formatTime(latestExistingEndTime)}.`
      });
    }

    // --- Update if paper_code exists ---
    const existingSlotIndex = timeSlots.findIndex(slot => slot.paper_code === paper_code);

    if (existingSlotIndex !== -1) {
      courseRoutine.days[dayKey][existingSlotIndex].time = time;
      resMessage = `Time updated for paper_code ${paper_code} on ${day}`;
    } else {
      const newTimeSlot = { time, paper, paper_code };
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//helper
// Convert "9:00 A.M - 10:00 A.M" → start time
function extractStartTime(timeRange) {
  const [start] = timeRange.split('-').map(t => t.trim());
  return parseTime(start);
}

// Convert "9:00 A.M - 10:00 A.M" → end time
function extractEndTime(timeRange) {
  const [, end] = timeRange.split('-').map(t => t.trim());
  return parseTime(end);
}

// Parse "12:00 P.M" into a Date object (hour, minute)
function parseTime(timeStr) {
  const [time, meridian] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let hour24 = hours;
  if (meridian.toUpperCase() === 'P.M' && hours !== 12) {
    hour24 += 12;
  } else if (meridian.toUpperCase() === 'A.M' && hours === 12) {
    hour24 = 0;
  }

  return new Date(1970, 0, 1, hour24, minutes);
}

// Format time for readable error messages
function formatTime(dateObj) {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return dateObj.toLocaleTimeString('en-US', options);
}



const deleteTimeSlot = async (req, res) => {
  try {
    const { course_id, sem, day, paper_code } = req.body;

    
    const courseRoutine = await CourseRoutine.findOne({
      course_id,
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
    const { course_id, sem, day, paper_code, is_live, topic, image } = req.body;

    const dayToWeekdayMap = {
      "Day 0":"Sunday",
      "Day 1": "Monday",
      "Day 2": "Tuesday",
      "Day 3": "Wednesday",
      "Day 4": "Thursday",
      "Day 5": "Friday",
      "Day 6": "Saturday"
    };

    // Validate the day input
    if (!dayToWeekdayMap.hasOwnProperty(day)) {
      return res.status(400).json({ message: "Invalid day provided. Use Day 0 to Day 6." });
    }

    // Check if today matches the given day
    const today = new Date();
    const options = { weekday: 'long' };
    const currentDayName = today.toLocaleDateString('en-US', options);

    if (currentDayName !== dayToWeekdayMap[day]) {
      return res.status(400).json({
        message: `You can only update slots for ${day} (${dayToWeekdayMap[day]}) on ${dayToWeekdayMap[day]}. Today is ${currentDayName}.`
      });
    }

    // ---- Calculate date_range for the week ----
    const currentDayOfWeek = today.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
    const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek;

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + diffToMonday);

    const saturdayDate = new Date(mondayDate);
    saturdayDate.setDate(mondayDate.getDate() + 5); // Monday + 5 days = Saturday

    const startDay = mondayDate.getDate().toString().padStart(2, '0');
    const endDay = saturdayDate.getDate().toString().padStart(2, '0');

    const monthName = mondayDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();

    const dateRange = `[${startDay}-${endDay}] ${monthName}`;

    // ---- Format current date as YYYY-MM-DD ----
    const formattedDate = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // ---- Find Course Routine ----
    const courseRoutine = await CourseRoutine.findOne({ course_id, sem });

    if (!courseRoutine) {
      return res.status(404).json({ message: "Course routine not found." });
    }

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

    // ---- Update Fields ----
    courseRoutine.days[dayKey][slotIndex].date = formattedDate;
    courseRoutine.days[dayKey][slotIndex].date_range = dateRange;

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
      message: `Time slot updated for paper_code ${paper_code} on ${day} (${dayToWeekdayMap[day]}).`,
      date: formattedDate,
      date_range: dateRange,
      data: updatedRoutine
    });

  } catch (error) {
    console.error("Error updating time slot details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRoutineByCourseIdAndSem = async (req, res) => {
  try {
    const { course_id, sem } = req.params;

    if (!course_id || !sem) {
      return res.status(400).json({ message: 'Both course_id and sem are required' });
    }

    const query = {
      course_id: Number(course_id), 
      sem: sem.toString()           
    };

    const routines = await CourseRoutine.find(query);

    if (!routines || routines.length === 0) {
      return res.status(404).json({
        message: 'No routine found for the given course_id and sem'
      });
    }

    res.status(200).json({
      message: 'Routine data fetched successfully',
      data: routines
    });

  } catch (error) {
    console.error('Error fetching routine data:', error);
    res.status(500).json({ message: 'Server error', error });
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


const getAllRoutinbycourse_id = async (req, res) => {
  try {
    // Extract params and trim any potential whitespace
    const courseId = req.params.course_id?.trim();
    const sem = req.params.sem?.trim();

    // Validate required fields
    if (!courseId || !sem) {
      return res.status(400).json({
        success: false,
        message: 'Both course_id and sem are required'
      });
    }

    // Build query object
    const query = {
      course_id: Number(courseId), // Convert to number if your schema stores it as a number
      sem: sem.toString()          // Ensure it's a string if stored as such
    };

    // Fetch routines based on query
    const routines = await CourseRoutine.find(query);

    // If no routines found, send a 404 response
    if (!routines || routines.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No routine found for course_id ${courseId} and sem ${sem}`
      });
    }

    // Success response with data
    res.status(200).json({
      success: true,
      message: 'Routine data fetched successfully',
      data: routines
    });

  } catch (error) {
    console.error('Error fetching routine data:', error.message);

    // Error response
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching routine data',
      error: error.message
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses" });
  }
};

const getAllCoursesBYId = async (req, res) => {
  try {
    const { course_id } = req.query;

    let courses;

    if (course_id) {
      // Convert course_id to number (if your DB stores it as number)
      courses = await Course.find({ course_id: Number(course_id) });

      if (courses.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
    } else {
      courses = await Course.find();
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses" });
  }
};



const createCourse = async (req, res) => {
 
  try {
    const existingCourse = await Course.findOne({ course_id: req.body.course_id });
    if (existingCourse) {
      return res.status(400).json({ message: "Course ID already exists" });
    }
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error); // Log the error to see details
    res.status(500).json({ message: "Error creating course", error: error.message });
  }
};

const findScheduleByPaperCodes = async (req, res) => {
  try {
    // Get paper codes from request body
    const { paper_codes } = req.body;
    
    if (!paper_codes || !Array.isArray(paper_codes) || paper_codes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of paper codes" 
      });
    }

    // Find all course routines containing these paper codes
    // const CourseRoutine = mongoose.model("CourseRoutine");
    const routines = await CourseRoutine.find({
      $or: [
        { "days.day1.paper_code": { $in: paper_codes } },
        { "days.day2.paper_code": { $in: paper_codes } },
        { "days.day3.paper_code": { $in: paper_codes } },
        { "days.day4.paper_code": { $in: paper_codes } },
        { "days.day5.paper_code": { $in: paper_codes } },
        { "days.day6.paper_code": { $in: paper_codes } }
      ]
    });

    if (!routines || routines.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedules found for the given paper codes"
      });
    }

    // Process the results to return only the relevant information
    const results = routines.map(routine => {
      const result = {
        course_id: routine.course_id,
        week: routine.week,
        sem: routine.sem,
        date_range: routine.date_range
      };

      // Process each day to find matching paper codes
      for (let i = 1; i <= 6; i++) {
        const dayKey = `day${i}`;
        if (routine.days[dayKey] && routine.days[dayKey].length > 0) {
          // Filter slots that match the requested paper codes
          const filteredSlots = routine.days[dayKey].filter(slot => 
            paper_codes.includes(slot.paper_code)
          );
          
          if (filteredSlots.length > 0) {
            // Add this day to the result if it has matching slots
            result[dayKey] = filteredSlots;
          }
        }
      }

      return result;
    });

    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Error finding schedule by paper codes:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving schedule",
      error: error.message
    });
  }
};
module.exports = { getAllReotines, addRoutines, deleteRoutine,addRoutinesNormal ,deleteTimeSlot ,updateSlotDetails , getRoutineByCourseIdAndSem , getAllRoutinbycourse_id,getAllCourses, createCourse,getAllCoursesBYId,findScheduleByPaperCodes};
