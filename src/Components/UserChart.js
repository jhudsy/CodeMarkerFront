import { Line } from 'react-chartjs-2'
import Dropdown from 'react-dropdown'
import Events from './../client.js'
import moment from 'moment'
import React from 'react'

class UserChart extends React.Component {

    constructor (props) {
        super(props)
        this.state = {
            id: '',
            user: [],
            courseNames: [],
            selectedCourse: '',
            username: '',
            options: {
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            data: {
                labels: [],
                datasets: [{
                    label: '',
                    data: []
                },
                ]
            }
        }
    }

    componentDidMount () {
        Events.on('onUserRetrieved', (user) => {
            this.setState({user: user})
            this.processData()
        })
    }

    processData () {
        let data = {}
        data.labels = []
        data.datasets = []

        let course = {}

        if (this.state.selectedCourse == '') {
            course = this.state.user.courses.filter(course => course.assessments.length > 0)[0]
            console.log(course)
            if (course == null) {
                this.setCourseNames()
                return
            }
        } else {
            course = this.state.user.courses.filter(course => course.name == this.state.selectedCourse)[0]
        }

        let dataset = []
        dataset.data = []
        dataset.label = this.state.selectedCourse

        dataset.borderColor = []
        dataset.borderColor.push('crimson')
        dataset.borderWidth = 1

        course.assessments.forEach(function (assessment) {
            let bestSubmission = null
            let bestMark = 0
            assessment.submissions.forEach(function (submission) {
                if (submission != null) {
                    if (submission.marks > bestMark) {

                        bestSubmission = submission
                        bestMark = submission.marks
                    }
                }
            })
            if (bestSubmission != null) {
                let date = moment(bestSubmission.updated_at)

                data.labels.push(date.format('DD/MM'))
                dataset.data.push({x: date, y: bestSubmission.marks})

            }
        })
        data.datasets.push(dataset)

        this.setState({data: data})

        this.setCourseNames()
    }

    setCourseNames () {
        let courses = this.state.user.courses
        courses = courses.filter(course => course.assessments.length > 0)
        this.setState({courseNames: courses.map(course => course.name)})
    }

    onCourseSelected (choice) {
        this.setState({selectedCourse: choice.value}, () => {
            this.processData()
        })
    }

    render () {
        return (
            <div>
                <Line data={this.state.data} options={this.state.options} width={400} height={80}/>
                <br/>
                <Dropdown
                    className="dropDown"
                    options={this.state.courseNames}
                    onChange={this.onCourseSelected.bind(this)}
                    value={this.state.selectedCourse}
                    placeholder="Select Course to Display"/>
                <br/>
            </div>
        )
    }
}

export default UserChart