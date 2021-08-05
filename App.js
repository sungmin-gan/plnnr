import React, { Component } from 'react'
import './App.css'
import firebase from './firebase'
import Course from './data/Course'
import Dash from './Dash'

class App extends Component {

  state = {
    width: 0,
    height: 0,
    changed: false,
    sessionID: null,
    sessionLoaded: false,
    courses: [],
    currentPage: "Home",
    currentColor: 4,
    showAddCourse: false,
    wikiArticle: {},
  }

  setWindowSize = () => {
    let width = "";
    let height = 0;
    if (window.innerWidth > 1099) { width = "L" }
    else if (window.innerWidth < 1100 && window.innerWidth > 850) { width = "M" }
    else { width = "S" }

    this.setState(() => { return { width: width, height: window.innerHeight } })
  }

  setSessionData = () => {
    firebase.firestore()
      .collection('demo')
      .add({})
      .then((newDoc) => {
        firebase.firestore()
          .collection('student_1/info/courses')
          .get()
          .then((courses) => {
            courses.docs.map((course) => {
              firebase.firestore().collection(`demo/${newDoc.id}/courses`).doc(course.id).set(course.data())
            })
          })

        firebase.firestore()
          .collection('student_1/info/obligations')
          .get()
          .then((obligations) => {
            obligations.docs.map((ob) => {
              firebase.firestore().collection(`demo/${newDoc.id}/obligations`).add(ob.data())
            })
          })

        firebase.firestore()
          .collection('student_1/info/completed')
          .get()
          .then((completed) => {
            completed.docs.map((comp) => {
              firebase.firestore().collection(`demo/${newDoc.id}/completed`).add(comp.data())
            })
          })

        firebase.firestore()
          .collection('student_1/info/graded')
          .get()
          .then((graded) => {
            graded.docs.map((gr) => {
              firebase.firestore().collection(`demo/${newDoc.id}/graded`).add(gr.data())

            })
            this.setState(() => { return { sessionID: newDoc.id, sessionLoaded: true } })
            this.getCourses()
          })
      })
  }

  getWikiArticle = async () => {
    let Parser = require('rss-parser');
    let parser = new Parser({
      customFields: {
        item: ['image', 'url']
      }
    });
    const getFeed = async () => {
      let feed = await parser.parseURL('https://plnnr-cors-server.herokuapp.com/https://ifttt-testing.toolforge.org/ifttt/v1/triggers/article_of_the_day?lang=en');
      this.setState(() => { return { wikiArticle: feed.items[3] } })
    }
    getFeed();

  }

  componentDidMount() {
    this.setWindowSize();
    this.setSessionData();
    this.getWikiArticle();
    window.addEventListener("resize", () => { this.setWindowSize() })
  }

  getCourses = () => {
    firebase.firestore()
      .collection(`demo/${this.state.sessionID}/courses`)
      .get()
      .then((courses) => {
        let newCourses = [];
        courses.docs.map((doc) => {
          newCourses.push(doc.data())
        })
        this.setState(() => { return { courses: newCourses } })
      })
  }

  setCurrentPage = (id, color) => {
    if (!this.state.showAddCourse) {
      this.setState(() => { return { currentPage: id, currentColor: color } })
      this.getCourses();
    }

  }

  setFormData = (field, value, instructor = false, categories = false) => {
    let data = this.state.data;
    if (instructor) {
      data['instructor'][field] = value;
    }
    else if (categories) {
      data['categories'][field] = value;
    }
    else { data[field] = value }
    this.setState(() => { return { data: data } })
  }

  toggleAddCourseForm = () => {
    this.setState(() => { return { showAddCourse: !this.state.showAddCourse, currentPage: "Home", currentColor: 4 } })
  }

  addCourse = (e) => {
    e.preventDefault()
    let data = this.state.data;
    let breakdownTotal = 0;
    for (let key in data['categories']) {
      breakdownTotal += Number(data['categories'][key]);
    }
    if (data['id'] === "" || data['location'] === "" || data['times'] === ""
      || data['instructor']['name'] === "" || data['instructor']['email'] === "") {
      this.setState(() => { return { error: "Please fill out all required fields." } })
    }
    else if (breakdownTotal !== 100) {
      this.setState(() => { return { error: "Breakdown percentages must add up to 100." } })
    }
    else {
      let newCategories = {};
      Object.keys(data.categories).map((key) => {
        if (Number(data['categories'][key]) > 0) {
          newCategories[key] = data['categories'][key];
        }
      })
      data.categories = newCategories;
      firebase.firestore()
        .collection(`demo/${this.state.sessionID}/courses`)
        .doc(data.id)
        .set(data)
        .then(() => {
          this.closeForm(e);
        })
    }
  }

  render() {
    let wiki = this.state.wikiArticle;

    if (this.state.sessionLoaded) {

      return (
        <div className={`App gridWidth${this.state.width}`}>
          <header>
            <div id="plnnr" onClick={() => { this.setCurrentPage("Home", 4) }}>Plnnr</div>
            {this.state.width !== "L" &&
              <React.Fragment>
                <div id="headerNav">
                  <div className={`navText back${this.state.currentColor}`}>{this.state.currentPage.toUpperCase()}&nbsp;&nbsp;<i class="fas fa-caret-down"></i></div>
                  <div className="headerSelect">
                    {this.state.currentPage !== "Home" &&
                      <div onClick={() => { this.setCurrentPage("Home", 4) }}>HOME</div>
                    }
                    {this.state.courses.map((course, index) =>
                      course.id !== this.state.currentPage &&
                      <div key={index} onClick={() => { this.setCurrentPage(course.id, index) }}>{course.id.toUpperCase()}</div>
                    )}
                  </div>
                </div>
                <div id={this.state.showAddCourse ? 'cancelAddCourse' : 'headerCourseAdd'}>
                  <i class="fas fa-plus-circle" onClick={() => this.toggleAddCourseForm()}></i>
                </div>
              </React.Fragment>
            }

          </header>
          {this.state.width === "L" &&
            <div className="navBar">
              <div className={`navTab back4 tabUnselected`} id="homeButton" onClick={() => { this.setCurrentPage('Home', 4) }}>HOME</div>
              <div className="navList">
                {this.state.courses.map((course, index) =>
                  <div>
                    <a className={`back${index % 5} navTab tabUnselected`} key={course.id} id={course.id} onClick={() => { this.setCurrentPage(course.id, index % 5) }}>
                      {course.id.toUpperCase()}
                    </a>
                  </div>
                )}
              </div>
              <div className='navTab addCourseButton' id={this.state.showAddCourse ? 'cancelAddCourseBox' : null} onClick={() => this.toggleAddCourseForm()}><i class="fas fa-plus-circle" id={this.state.showAddCourse ? 'cancelAddCourse' : null}></i>{this.state.showAddCourse ? 'Cancel' : 'Add Course'}</div>
            </div>
          }

          <div className='contentArea'>
            {this.state.currentPage === "Home" &&
              <Dash seshID={this.state.sessionID} showAddForm={this.state.showAddCourse} wiki={this.state.wikiArticle} width={this.state.width} height={this.state.height} toggleAddForm={this.toggleAddCourseForm} getCourses={this.getCourses} setPage={this.setCurrentPage}></Dash>
            }
            {this.state.currentPage !== "Home" && !this.state.showAddCourse &&
              <Course currentCourse={this.state.currentPage} color={this.state.currentColor} width={this.state.width} seshID={this.state.sessionID}></Course>
            }

          </div>

          {this.state.width !== "S" && wiki.image !== undefined &&

            <div className="dashSideContent">
              {console.log(wiki)}
              <div className={`dashUpcomingTitle back${this.state.currentColor}`}>Wiki of the Day</div>
              <div className="dashArticle">
                <img className="wikiImg" src={wiki.image.url}></img>
                <div className="wikiContent">
                  <a href={`${wiki.url}`} target="_blank" className="wikiTitle">{wiki.title}</a>
                  <div className="wikiText">{wiki.content.substr(0, this.state.height / 5)}...</div>
                </div>
              </div>
            </div>
          }


        </div>
      );
    }
    else { return null }

  }
}

export default App;
