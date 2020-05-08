import React,{useState,useEffect} from 'react'
import {List,ListItem,Left,Right,Text,Icon,Button,Toast} from 'native-base'
import {View,StyleSheet} from 'react-native'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// import EventScreen from './eventInfo';
import Modal from 'react-native-modal';

const PastEvents = ({user, navigation}) => {
    const eventColl = firestore().collection('Events')
    const userColl = firestore().collection('Users')
    const [userData,setUserData] = useState(null)
    const [myid, setmyid] = useState(null);
    const [currEvent,setCurrEvent] = useState({})
    const [eventList,setEventList] = useState([])
    const [showModal,setShowModal] = useState(false)
    const [participatingEvents,setParticipatingEvents] = useState([])


    useEffect(() => {
        console.log("Getting current user");
        getCurrentUser();
    })
    
    useEffect(()=>{
        try{
            if(myid){
                // setUser(user)
                const subscriber = firestore()
                            .collection('Users')
                                .doc(myid)
                                .onSnapshot(documentSnapshot => {
                                    setUserData(documentSnapshot.data())
                                    setParticipatingEvents(documentSnapshot.data().participatingEvents)
                                    
                                });
                return subscriber;
                }
        }
        catch(err){
            console.log(err)
        }
        

    },[myid])


    useEffect(()=>{
        if (participatingEvents && participatingEvents.length>0){
            const eventSubscriber = firestore().collection("Events")
                                                .where("topic","in",userData.topics)
                                                .onSnapshot(querySnapshot=>{
                                                    let eventsData= []
                                                    querySnapshot.forEach(doc=>{
                                                        let event = doc.data();
                                                        if(event.state=="finished" && participatingEvents.includes(doc.id)){
                                                            eventsData.push({...doc.data(),id:doc.id})
                                                        }
                                                    })
                                                    setEventList(eventsData)
                                                })
        }
        
    },[participatingEvents])

    const getCurrentUser = () => {
        auth().onAuthStateChanged((user) =>{
          // console.log("Current User ", user);
          setmyid(user.email);
        })
      }

    const onUnregister = async (event) => {
        try{
            const eventId = event.id
            
            if(user){
                userColl.doc(user["email"]).update({participatingEvents:firestore.FieldValue.arrayRemove(eventId)})
                eventColl.doc(eventId).update({registeredUsers:firestore.FieldValue.arrayRemove(user["email"])})
            }
            // await eventColl.doc(eventId).update({registeredUsers:registeredUsers})
            setShowModal(false)
            Toast.show({text:"Successfully Unregistered",buttonText:"Okay",duration:3000})
        }
        catch(error){
            console.log(error)
        }
    }

    const onView = (event) => {
        setShowModal(true)
        setCurrEvent(event)
    }

    const onStart = (event) => {
        console.log("Event start clicked ", event);
        navigation.navigate('EventMenu',{screen:'EventSummary',params:{                                                              
            myid : myid, 
            eventId: event.id
          }
          
        });
        
    }

    console.log(eventList, participatingEvents);
    return(
        <View>
            <List>
                <ListItem itemHeader first style={styles.listHeader}>
                <Text style={styles.listHeaderText}>PAST EVENTS</Text>
                </ListItem>

                {eventList.map(event => 
                <ListItem>
                    <Left>
                        <Text>{event.type} ({event.distance})</Text>
                    </Left>
                    <Right style={{flex:1}}>
    
                    <Button style={styles.button} bordered rounded onPress={()=>onStart(event)}><Text>View</Text></Button>
                    </Right>
                </ListItem>
                )}

                
            </List>
{/* 
            <Modal
            isVisible={showModal}
            onBackdropPress={()=>setShowModal(false)}
            backdropColor="#FFF"
            backdropOpacity={1}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            animationInTiming={600}
            animationOutTiming={600}
            backdropTransitionInTiming={600}
            backdropTransitionOutTiming={600}>
                <EventScreen event={currEvent} onUnregister={onUnregister}/>
            </Modal> */}
        </View>
    )
}

const styles = StyleSheet.create({
    listHeader:{
        justifyContent:'center'
    },
    listHeaderText:{
        fontSize:20,
        fontWeight:'bold'
    }
})

export default PastEvents