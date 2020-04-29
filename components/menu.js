import React, {Component,useState,useEffect} from 'react';
import {Container,Text,Content,Header, Icon, Picker, Form,Button,Item,Input} from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid";
import {View,StyleSheet,Image} from 'react-native';
import GetLocation from 'react-native-get-location'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import configs from "../conf.json"



const Menu = ({navigation}) => {

    const [currLocation,setCurrLocation] = useState({latitude:null,longitude:null})
    let state = ''
    let zipCode = ''
    let country = ''
    let city =' '
    const userColl = firestore().collection('Users')
    // console.log("Rendered")
    const onAuthChanged = async(user) => {
        try{
            const location = await GetLocation.getCurrentPosition({enableHighAccuracy: true,timeout: 15000,});
            let coordObj = {latitude:location["latitude"],longitude:location["longitude"]}
            setCurrLocation(coordObj)
            // console.log(`https://maps.googleapis.com/maps/api/geocode/json?address=${coordObj.latitude},${coordObj.longitude}&key=${configs.mapsDirectionsKey}`)
            let response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + coordObj.latitude.toString() + ',' + coordObj.longitude.toString() + '&key=' + configs["mapsDirectionsKey"])
            let data = await response.json()
            
            for (let val of data["results"][0]["address_components"]){
                if(val["types"].includes("administrative_area_level_1")){
                    state = val["short_name"]
                }
                else if(val["types"].includes("locality")){
                    city = val["long_name"].toLowerCase()
                }
                else if(val["types"].includes("country")){
                    country = val["short_name"]
                }
                else if(val["types"].includes("postal_code")){

                    zipCode = val["long_name"]
                }
            }

            await userColl.doc(user["email"])
                               .set({lastUpdatedLocation:coordObj,
                                    country:country,
                                    state:state,
                                    city:city,
                                    zipCode:zipCode},{merge:true})

        }
        catch(error){
            console.log(error)
        }
        

    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthChanged)
			// getCurrPos();
		return subscriber
    },[])
    
    return (

        <Grid style={styles.grid}>
            <Row style={styles.row1} size={1}></Row>
            <Row style={styles.row2} size={1}>
            <Button full rounded style={styles.button} onPress={() => navigation.navigate('MenuStack',{screen:'Wizard',params:{currLocation:currLocation}})}><Text style={{fontSize:12}}> Create Event </Text></Button>
            <Button full rounded style={styles.button} onPress={() => navigation.navigate('MenuStack',{screen:'ShowEvents',params:{currLocation:currLocation}})}><Text style={{fontSize:12}}> Register for Event </Text></Button>
            </Row>
        </Grid>
       
    )
}

const styles = StyleSheet.create({
    grid:{
        alignItems:'center',
    },
    row2:{
        // backgroundColor:'green'
    },
    button:{
        width:'40%',
        height:50,
        alignSelf:'center',
        margin:10,
    },
    form:{
        flex:1,
        justifyContent : 'center'
    },
    
})
export default Menu;