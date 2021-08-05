import React, { Component } from 'react';
import firebase from '../firebase'
import './Course.css'



class Course extends Component {

    constructor() {
        super();
        this.profInfoRef = React.createRef();
        this.addFormRef = React.createRef();
        this.editButtonRef = React.createRef();
    }

    state = {
        infoTab: "instructor",
        assignmentsTab: "upcoming",
        upcoming: [],
        submitted: [],
        graded: [],
        courses: [],
        catIndex: 0,
        hasGraded: false,
        showAdd: false
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

    getCompleted = () => {
        firebase.firestore()
            .collection(`demo/${this.props.seshID}/completed`)
            .orderBy("due")
            .get()
            .then((completed) => {
                let submitted = [];
                completed.docs.map((doc) => {
                    let tempDoc = doc.data();
                    tempDoc['id'] = doc.id;
                    submitted.push(tempDoc)
                })
                this.setState(() => { return { submitted: submitted } })
            })

    }

    getGraded = () => {
        firebase.firestore()
            .collection(`demo/${this.props.seshID}/graded`)
            .orderBy("due")
            .get()
            .then((graded) => {
                let newGraded = [];
                graded.docs.map((doc) => {
                    newGraded.push(doc.data())
                })
                this.setState(() => { return { graded: newGraded } })
            })
    }

    getCourses = () => {
        firebase.firestore()
            .collection(`demo/${this.props.seshID}/courses`)
            .get()
            .then((courses) => {
                let newCourses = [];
                courses.docs.map((doc) => {
                    newCourses.push(doc.data())
                })
                this.setState(() => { return { courses: newCourses } })
            })
    }

    componentDidMount() {
        this.getUpcoming();
        this.getCompleted();
        this.getGraded();
        this.getCourses();
    }

    changeAssignmentOption = (option) => {
        this.setState(() => { return { assignmentsTab: option } })
    }

    changeInfoOption = (option) => {
        this.setState(() => { return { infoTab: option } })
    }

    completeAssignment = (id) => {
        firebase
            .firestore()
            .collection(`demo/${this.props.seshID}/obligations`)
            .doc(id)
            .get()
            .then((doc) => {
                firebase
                    .firestore()
                    .collection(`demo/${this.props.seshID}/completed`)
                    .doc(id)
                    .set(doc.data())
                    .then(() => {
                        firebase
                            .firestore()
                            .collection(`demo/${this.props.seshID}/obligations`)
                            .doc(id)
                            .delete()
                            .then(() => {
                                this.getUpcoming();
                                this.getCompleted();
                            })
                    })
            })
    }

    gradeAssignment = (e, id) => {
        e.preventDefault();
        let docID = this.props.seshID;
        let earned = e.target[0].value;
        let max = e.target[1].value;

        firebase
            .firestore()
            .collection(`demo/${this.props.seshID}/completed`)
            .doc(id)
            .get()
            .then((doc) => {
                firebase
                    .firestore()
                    .collection(`demo/${this.props.seshID}/graded`)
                    .doc(id)
                    .set(doc.data())
                firebase
                    .firestore()
                    .collection(`demo/${this.props.seshID}/graded`)
                    .doc(id)
                    .update({
                        earned: earned,
                        max: max
                    })
                firebase
                    .firestore()
                    .collection(`demo/${this.props.seshID}/completed`)
                    .doc(id)
                    .delete()
                    .then(() => {
                        this.getCompleted();
                        this.getGraded();
                    })
            })

    }

    editProfInfo = () => {
        for (let i = 1; i < 6; i++) { this.profInfoRef.current[i].disabled = false }
        this.editButtonRef.current.style.display = 'none';
        this.profInfoRef.current[0].hidden = false;
    }

    updateProfInfo = (e) => {
        e.preventDefault();
        for (let i = 1; i < 6; i++) { this.profInfoRef.current[i].disabled = true };
        this.profInfoRef.current[0].hidden = true;
        let name = this.profInfoRef.current[1].value;
        let email = this.profInfoRef.current[2].value;
        let phone = this.profInfoRef.current[3].value;
        let office = this.profInfoRef.current[4].value;
        let hrs = this.profInfoRef.current[5].value;
        let instructor = {
            name: name,
            email: email,
            phone: phone,
            office: office,
            officeHrs: hrs
        }
        firebase.firestore()
            .collection(`demo/${this.props.seshID}/courses`)
            .doc(this.props.currentCourse)
            .update({
                instructor: instructor
            })
            .then(() => { this.editButtonRef.current.style.display = ''; this.getCourses() })
    }

    toggleAddForm = () => {
        this.setState(() => { return { showAdd: !this.state.showAdd } })
        if (this.state.showAdd === false) {
            this.addFormRef.current.reset();
        }
    }

    addAssignment = (e) => {
        e.preventDefault();
        let formDate = this.addFormRef.current[0].value;
        let date = Number(formDate.substr(2, 2)) * 10000 + Number(formDate.substr(5, 2) * 100) + Number(formDate.substr(8, 2));
        let newAssignment = {
            category: this.addFormRef.current[2].value,
            course: this.props.currentCourse,
            due: date,
            title: this.addFormRef.current[1].value
        }
        firebase
            .firestore()
            .collection(`demo/${this.props.seshID}/obligations`)
            .add(newAssignment)
            .then(() => {
                this.getUpcoming();
                this.toggleAddForm()
            })
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
        let subInfo = "";
        let prof = {};
        let gradeCategories = [];
        this.state.courses.map((course) => {
            if (course.id === this.props.currentCourse) {
                prof = course.instructor;
                Object.keys(course.categories).map((key) => {
                    gradeCategories.push(key)
                })
                gradeCategories.sort()
                subInfo = `${course.location} | ${course.times} `
            }
        })

        let gradedFlag = false;

        const graded = () => { gradedFlag = true; return true }

        return (
            <div className="classInfo">

                <div className={`courseInfoSection margin${this.props.width}`} >
                    <div className={`titleWrap back${this.props.color}`} >
                        <h6 style={{ fontWeight: 'bold' }}>{this.props.currentCourse.toUpperCase()}<br /><span className="subInfo">{subInfo}</span></h6>
                        <div className="courseOptions">
                            <div className={`gBookOption ${this.state.infoTab === "instructor" ? 'selected' : 'unselected'}`} onClick={() => { this.changeInfoOption("instructor") }}>
                                Instructor</div>
                            <div className={`instructorOption ${this.state.infoTab === "grades" ? 'selected' : 'unselected'} `} onClick={() => { this.changeInfoOption("grades") }}>
                                Gradebook</div>
                        </div>
                    </div>

                    <div className="infoBox">

                        {this.state.infoTab === "instructor" &&
                            <form className="profInfo" ref={this.profInfoRef} onSubmit={(e) => { this.updateProfInfo(e) }}>
                                <i ref={this.editButtonRef} class="fas fa-pencil-alt" id="editProf" onClick={() => { this.editProfInfo() }}></i>
                                <button type="submit" id="profUpdate" hidden>Done</button>
                                <i class="fas fa-user-graduate"></i>
                                <div className="infoGrid" >
                                    <input className="profName" defaultValue={prof.name} disabled></input>
                                    <input defaultValue={prof.email} disabled style={{ marginBottom: "0.5em" }}></input>
                                    <div>Phone:&nbsp;<input defaultValue={prof.phone} disabled></input></div>
                                    <div>Office:&nbsp;<input defaultValue={prof.office} disabled></input></div>
                                    <div>Hours:&nbsp;<input defaultValue={prof.officeHrs} disabled></input></div>

                                </div>
                            </form>
                        }

                        {this.state.infoTab === "grades" &&
                            <div className="gradebook">
                                <div className="dropdownWrap">
                                    <div className="catTitle">{gradeCategories[this.state.catIndex]}</div>
                                    <div className="dropdown">
                                        {gradeCategories.map((cat, index) =>
                                            <div onClick={() => { this.setState(() => { return { catIndex: index } }) }}>{cat}</div>)
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div className="grades" >
                                        {this.state.graded.map((assignment) =>
                                            <React.Fragment>
                                                {
                                                    (assignment.course === this.props.currentCourse && assignment.category === gradeCategories[this.state.catIndex]) && graded() &&
                                                    <div className="gradebookLine"><div className="assignmentTitle">{assignment.title}</div><div>{assignment.earned}/{assignment.max}</div></div>
                                                }
                                            </React.Fragment>
                                        )}
                                        {!gradedFlag && <div className="nothingMsg">Nothing here yet!</div>}
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <div id="obligationsSection" className={`ack${this.props.color}`}>
                    <div className={`titleWrap back${this.props.color}`}>
                        <h6>Assignments</h6>
                        <div className="courseOptions">
                            <div className={`gBookOption ${this.state.assignmentsTab === "upcoming" ? 'selected' : 'unselected'}`} onClick={() => { this.changeAssignmentOption("upcoming") }}>Upcoming</div>
                            <div className={`${this.state.assignmentsTab === "submitted" ? 'selected' : 'unselected'}`} onClick={() => { this.changeAssignmentOption("submitted") }}>Submitted</div>
                            <div className={`instructorOption ${this.state.assignmentsTab === "graded" ? 'selected' : 'unselected'}`} onClick={() => { this.changeAssignmentOption("graded") }}>Graded</div>
                            {this.state.assignmentsTab === "upcoming" &&
                                <div className={`obAdd ${this.state.showAdd ? 'cancel' : null}`} onClick={() => this.toggleAddForm()}><i class="fas fa-plus" ></i></div>
                            }
                        </div>
                    </div>
                    <div className="assignmentsBox">
                        {this.state.assignmentsTab === "upcoming" &&
                            <form className={`assignment ${this.state.showAdd ? null : 'hidden'}`} ref={this.addFormRef} onSubmit={(e) => { this.addAssignment(e) }}>
                                <div className="assignmentDueDate">
                                    <div className="subCourse">Due Date</div>
                                    <input type="date" required></input>
                                </div>
                                <div className="assignmentInfo">
                                    <input className="label hw" placeholder="Assignment Title" required></input>
                                    <select className="selectCat" required >
                                        <option value="" selected hidden>Category</option>
                                        {gradeCategories.map((cat) =>
                                            <option value={cat}>{cat}</option>
                                        )}
                                    </select>
                                </div>

                                <button id="addBox" ><i class="fas fa-plus-circle"></i></button>
                            </form>
                        }

                        {this.state.assignmentsTab === "upcoming" && this.state.upcoming.map((assignment) =>
                            <React.Fragment>

                                {assignment.course === this.props.currentCourse &&
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
                                }
                            </React.Fragment>
                        )}

                        {this.state.assignmentsTab === "submitted" && this.state.submitted.map((assignment) =>
                            <React.Fragment>
                                {assignment.course === this.props.currentCourse &&
                                    <form className="assignment" onSubmit={(e) => this.gradeAssignment(e, assignment.id)}>
                                        <div className="assignmentDueDate">
                                            <div className="subCourse">Submitted</div>
                                            <div >{assignment.due.toString().substr(2, 2)}/{assignment.due.toString().substr(4, 2)}</div>
                                        </div>
                                        <div className="assignmentInfo assInfoSubmitted">
                                            <div className="label hw">{assignment.title}</div>
                                            <div className="label">{assignment.course}</div>
                                        </div>

                                        <div className="inputGradeBox" style={{ borderLeft: `${this.props.width === "S" ? 'none' : '1px solid lightgrey'}` }}>
                                            <div className="inputLine"><input type="number" required min="0"></input>&nbsp;/&nbsp;
                                        <input type="number" required min="1"></input></div>
                                            <div className="inputLine inputLabels">
                                                <div>earned</div>
                                                <div>max</div>
                                            </div>
                                        </div>
                                        <button type="submit">Grade</button>
                                    </form>
                                }
                            </React.Fragment>
                        )}

                        {this.state.assignmentsTab === "graded" && this.state.graded.map((assignment) =>
                            <React.Fragment>
                                {assignment.course === this.props.currentCourse &&
                                    <div className="assignment assGraded">
                                        <div className="assignmentDueDate">
                                            <div className="subCourse">Graded</div>
                                            <div>{assignment.due.toString().substr(2, 2)}/{assignment.due.toString().substr(4, 2)}</div>
                                        </div>
                                        <i id="catIcon" class={icons[assignment.category]}></i>
                                        <div className="assignmentInfo assInfoGraded">
                                            <div className="label hw">{assignment.title}</div>
                                            <div className="label">{assignment.course}</div>
                                        </div>
                                        <div className="scoreBox date">
                                            {assignment.earned}/{assignment.max}
                                        </div>

                                    </div>
                                }
                            </React.Fragment>
                        )}
                    </div>
                </div>


            </div >
        )
    }
}

export default Course