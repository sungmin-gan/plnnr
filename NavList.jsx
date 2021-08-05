import React, { useState, useEffect } from 'react';
import firebase from '../firebase'

function GetCoursesNames(docID) {
    const [courses, setCourses] = useState([])

    useEffect(() => {
        const unsubscribe = firebase
            .firestore()
            .collection(`demo/${docID}/courses`)
            .onSnapshot((snapshot) => {
                let newCourses = [];
                snapshot.docs.map((doc) => {
                    newCourses.push(doc)
                })
                setCourses(newCourses)
            })
        return () => unsubscribe()
    }, [])
    return courses
}


const NavList = (sessionID) => {
    const courses = GetCoursesNames(sessionID.sessionID);
    return (
        <div className="navList">
            {courses.map((course, index) =>
                <a className={`back navTab`} key={course.id} id={course.id} onClick={(e) => { console.log(this) }}>
                    {course.id.toUpperCase()}<br />
                    <span className="subCourse" id={course.id}>{course.data().times}</span><br />
                    <span className="subCourse" id={course.id}>{course.data().location}</span>
                </a>
            )}
        </div>
    )
}

export default NavList