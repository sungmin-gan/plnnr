import React, { Component } from 'react';
import firebase from './firebase'
import './Dash.css'

class Dash extends Component {

    constructor() {
        super();
        this.gradeErrRef = React.createRef();
        this.checkErrRef = React.createRef();
        this.addCourseFormRef = React.createRef();
    }

    state = {
        upcoming: [],
        showAddCourseForm: true
    }

    getUpcoming = () => {
        firebase.firestore()
            .collection(`demo/${this.props.seshID}/obligations`)
            .orderBy("due")
            .get()
            .then((obligations) => {
                let newUpcoming = [];
                obligations.docs.map((doc) => {
                    let tempDoc = doc.data();
                    tempDoc['id'] = doc.id;
                    newUpcoming.push(tempDoc)
                })
                this.setState(() => { return { upcoming: newUpcoming } })
            })

    }

    componentDidMount() {
        this.getUpcoming()
    }

    completeAssignment = (id) => {
        let docID = this.props.seshID;
        firebase
            .firestore()
            .collection(`demo/${docID}/obligations`)
            .doc(id)
            .get()
            .then((doc) => {
                firebase
                    .firestore()
                    .collection(`demo/${docID}/completed`)
                    .doc(id)
                    .set(doc.data())
                    .then(() => {
                        firebase
                            .firestore()
                            .collection(`demo/${docID}/obligations`)
                            .doc(id)
                            .delete()
                            .then(() => {
                                this.getUpcoming();
                            })
                    })
            })
    }

    addCourse = (e) => {
        e.preventDefault();
        let form = this.addCourseFormRef.current;
        let isChecked = false;
        let gradesSum = 0;
        let days = "";
        let catArr = ["Homework", "Classwork", "Quizzes", "Exams", "Labs", "Papers", "Projects"];
        let categories = {};
        for (let i = 3; i < 10; i++) {
            if (form[i].checked) {
                isChecked = true;
                days += form[i].value
            }
        }
        for (let i = 16; i < 23; i++) {
            gradesSum += Number(form[i].value)
            if (form[i].value > 0) { categories[catArr[i - 16]] = Number(form[i].value) }
        }
        if (gradesSum != 100) { this.gradeErrRef.current.hidden = false }
        else (this.gradeErrRef.current.hidden = true)
        if (!isChecked) { this.checkErrRef.current.hidden = false }
        else { this.checkErrRef.current.hidden = true }
        if (isChecked && gradesSum === 100) {
            let newCourse = {
                categories: categories,
                id: form[1].value,
                location: form[2].value,
                times: `${days} ${form[10].value}:${form[11].value} ${form[12].value} - ${form[13].value}:${form[14].value} ${form[15].value}`,
                instructor: {
                    name: `${form[23].value} ${form[24].value}`,
                    email: form[25].value,
                    phone: form[26].value,
                    office: form[27].value,
                    officeHrs: `${form[28].value}:${form[29].value} ${form[30].value} - ${form[31].value}:${form[32].value} ${form[33].value}`,
                }
            }
            firebase.firestore()
                .collection(`demo/${this.props.seshID}/courses`)
                .doc(newCourse.id)
                .set(newCourse)
                .then(() => {
                    this.props.getCourses();
                    this.props.toggleAddForm();
                })
        }
    }

    render() {
        let icons = {
            Homework: "fas fa-home",
            Classwork: "fas fa-school",
            Quizzes: "fas fa-question",
            Exams: "fas fa-tasks",
            Labs: "fas fa-vial",
            Papers: "far fa-file-alt",
            Projects: "fas fa-tools"
        }

        let wiki = this.props.wiki;

        return (
            <div id="dashWrap">

                {this.props.width === "S" && wiki.image !== undefined && !this.props.showAddForm &&
                    <div className="dashSideTop">
                        <div className={`dashUpcomingTitle back4`}>Wiki of the Day</div>
                        <div className="dashArticle">
                            <img className="wikiImg" src={wiki.image.url}></img>
                            <div className="wikiContent">
                                <a href={`${wiki.url}`} target="_blank" className="wikiTitle">{wiki.title}</a>
                                <div className="wikiText">{wiki.content.substr(0, this.props.height / 5)}...</div>
                            </div>
                        </div>
                    </div>
                }

                {!this.props.showAddForm &&
                    <div id="dashAssignmentsSection">
                        <div className="dashUpcoming">
                            <div className="dashUpcomingTitle back4">Upcoming Assignments</div>
                            <div className="dashAssignments">
                                {this.state.upcoming.map((assignment) =>

                                    <div className="assignment">
                                        <div className="assignmentDueDate">
                                            <div className="subCourse">Due</div>
                                            <div className="date">{assignment.due.toString().substr(2, 2)}/{assignment.due.toString().substr(4, 2)}</div>
                                        </div>
                                        <i id="catIcon" class={icons[assignment.category]}></i>
                                        <div className="assignmentInfo">
                                            <div className="label hw">{assignment.title}</div>
                                            <div className="label">{assignment.course}</div>
                                        </div>
                                        <div className="doneBox" onClick={() => { this.completeAssignment(assignment.id) }}><i class="fas fa-check" id="check"></i></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                }
                {this.props.showAddForm &&
                    <form id="addCourseForm" ref={this.addCourseFormRef} onSubmit={(e) => { this.addCourse(e) }}>
                        <button type="submit" id="addCourseButton">Submit</button>
                        <div className="dashUpcomingTitle addCourseColor">Add a course</div>
                        <div id="addCourseFormContainer">
                            <div className="addCourseSubTitle">Basic Information</div>
                            <div className="basicInfo">
                                <div className="nameLocationFields">
                                    <div>
                                        <label>Course Name</label>
                                        <input type="text" className="textInput" required></input>
                                    </div>
                                    <div>
                                        <label>Location</label>
                                        <input type="text" className="textInput" required></input>
                                    </div>
                                </div>

                                <div>
                                    <label>Day(s)</label>
                                    <div className="daysInput">
                                        <div>M<input type="checkbox" value="M"></input></div>
                                        <div>Tu<input type="checkbox" value="Tu"></input></div>
                                        <div>W<input type="checkbox" value="W"></input></div>
                                        <div>Th<input type="checkbox" value="Th"></input></div>
                                        <div>F<input type="checkbox" value="F"></input></div>
                                        <div>Sa<input type="checkbox" value="Sa"></input></div>
                                        <div>Su<input type="checkbox" value="Su"></input></div>
                                    </div>
                                </div>
                                <div className="classTimes">
                                    <div>From&nbsp;&nbsp;&nbsp;
                                    <input className="timeInput" type="number" required min={1} max={12}></input>&nbsp;:&nbsp;
                                    <input className="timeInput" type="number" required min={0} max={59}></input></div>
                                    <select required>
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                    <div>To&nbsp;&nbsp;&nbsp;
                                    <input className="timeInput" type="number" required min={1} max={12}></input>&nbsp;:&nbsp;
                                    <input className="timeInput" type="number" required min={0} max={59}></input></div>
                                    <select required>
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                                <div hidden id="checkError" ref={this.checkErrRef}>You must select at least one day.</div>
                            </div>
                            <div className="addCourseSubTitle">Grade Breakdown</div>

                            <div className="gradeBreakdowns">
                                <div className="gradeBreakdownsWrap">
                                    <div className='breakdownColumn'>
                                        <div className="labels">
                                            <label>Homework</label>
                                            <label>Classwork</label>
                                            <label>Quizzes</label>
                                            <label>Exams</label>
                                        </div>
                                        <div className="inputs">
                                            <input type="number" min={0} max={100}></input>
                                            <input type="number" min={0} max={100}></input>
                                            <input type="number" min={0} max={100}></input>
                                            <input type="number" min={0} max={100}></input>
                                        </div>
                                    </div>
                                    <div className='breakdownColumn'>
                                        <div className="labels">
                                            <label>Labs</label>
                                            <label>Papers</label>
                                            <label>Projects</label>
                                        </div>
                                        <div className="inputs">
                                            <input type="number" min={0} max={100}></input>
                                            <input type="number" min={0} max={100}></input>
                                            <input type="number" min={0} max={100}></input>
                                        </div>
                                    </div>
                                </div>
                                <div hidden id="gradesError" ref={this.gradeErrRef}>Sum of percentages must equal 100%.</div>
                            </div>

                            <div className="addCourseSubTitle">Instructor Information</div>
                            <div className="instructorInfoForm">
                                <div className="nameLocationFields">
                                    <div>
                                        <label>First Name</label>
                                        <input type="text" className="textInput" required></input>
                                    </div>
                                    <div>
                                        <label>Last Name</label>
                                        <input type="text" className="textInput" required></input>
                                    </div>
                                </div>
                                <div className="nameLocationFields">
                                    <div>
                                        <label>Email</label>
                                        <input type="email" className="textInput" required></input>
                                    </div>
                                    <div>
                                        <label>Phone</label>
                                        <input type="tel" className="textInput"></input>
                                    </div>
                                </div>

                                <div>
                                    <label>Office</label>
                                    <input type="text" className="textInput"></input>
                                </div>
                                <div>
                                    <label >Office Hours</label>
                                    <div className="classTimes" id="officeHoursTimes" >
                                        <div>From&nbsp;&nbsp;&nbsp;
                                    <input className="timeInput" type="number" min={1} max={12}></input>&nbsp;:&nbsp;
                                    <input className="timeInput" type="number" min={0} max={59}></input></div>
                                        <select>
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                        <div>To&nbsp;&nbsp;&nbsp;
                                    <input className="timeInput" type="number" min={1} max={12}></input>&nbsp;:&nbsp;
                                    <input className="timeInput" type="number" min={0} max={59}></input></div>
                                        <select>
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>

                            </div>


                        </div>
                    </form>
                }

                <div>

                </div>

            </div >
        )
    }

}

export default Dash;