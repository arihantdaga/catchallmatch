import React, { Component } from 'react';
import Slider, { Range, createSliderWithTooltip } from 'rc-slider';
import axios from "axios";


import 'rc-slider/assets/index.css';

const RangeSLiderTooltip = createSliderWithTooltip(Range); 

class PrefrenceForm extends Component{
    constructor(props){
        super(props);
        this.state = {bio_required: true, common_connections_prefered: 0, age_range:[20,24], distanceRange:[2,5], desired_matches: 0};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.distanceChange = this.distanceChange.bind(this);

        this.handleAgeChange = this.handleAgeChange.bind(this);
        this.ageChange = this.ageChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.url = window.url || "";
    }   
    distanceChange(value){
        this.setState({
            distanceRange: value
        });
    }
    handleSliderChange(value){
        
        console.log(this.state);
    }

    ageChange(value){
        this.setState({
            age_range: value
        });
    }
    handleAgeChange(value){
        
        console.log(this.state);
    }

    handleChange(event){
        console.log(this.state);
        const target = event.target;
        const name = target.name;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        if(name=='desired_matches' && value >100){
            alert("Ahh Sweetie! I thought you would be greedy. But sorry, not more than 100 at a time");
            value = 100;
        }
        this.setState({
            [name]: value
        });
    }
    
    handleSubmit(event){
        event.preventDefault();
        console.log("This is submitting now");
        console.log(this.state);
        let data = {...this.state};
        axios.post(`${this.url}\start_fun`,data).then(data=>{
            console.log(data);
        }).catch(err=>{
            console.log(err);
        });
        return false;
    }

    render(){
        return (
            <div className="prefrence-form-wrap">
                <h2>Tell me a little bit about your prefrence, and sit back and watch F.R.I.E.N.D.S. I'll do my job</h2>
                <form onSubmit={this.handleSubmit}>
                    <div className="formGroup">
                    <label>
                        Auth Token
                    </label>
                    <input name="auth_token" onChange={this.handleChange} name="auth_token" placeholder="Auth Token" type="text"/>
                    </div>

                    <div className="formGroup">
                    <label>
                    Bio Required ? 
                    <input type="checkbox" value = {this.state.bio_required} onChange={this.handleChange} name="bio_required" />
                    </label>
                    </div>
                    
                    <div className="formGroup">
                    <label>Common Connections Preferred ?</label>
                    <select value={this.state.common_connections_prefered} onChange={this.handleChange} name="common_connections_prefered">
                        <option value={1}>Preferred</option>
                        <option value={0}>Not Preferred</option>
                    </select>
                    </div>

                    <div className="formGroup">                
                    <label> Distance Range </label>
                    <div className="distance">
                        <RangeSLiderTooltip min={1} max={25} onChange={this.distanceChange} onAfterChange={this.handleSliderChange} value={this.state.distanceRange} />
                    </div>
                    </div>

                    <div className="formGroup">
                    <label> Age Range </label>
                    <div className="distance">
                        <RangeSLiderTooltip min={15} max={50} onChange={this.ageChange} onAfterChange={this.handleAgeChange} value={this.state.age_range} />
                    </div>
                    </div>
                    <div className="formGroup">
                        <label> Finally, How many matches do you want ? </label>
                        <input type = "number" value = {this.state.desired_matches} onChange = {this.handleChange} name = "desired_matches" />
                    </div>

                    <button type="submit" value="Get Set Go !" className="actionButton"> Get Set Go ! </button>

                </form>
            </div>
        )
    }
    
}

export default PrefrenceForm;