import React, { useEffect, useState } from "react"
import { View, Text, SafeAreaView, TextInput, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, FlatList } from "react-native"
import Header from "../components/Header"
import { getMatchedUserInfo } from "../lib/getMatchedUserInfo"
import { useRoute } from "@react-navigation/core"
import useAuth from "../hooks/useAuth"
import tw from "tailwind-rn"
import SenderMessage from "../components/SenderMessage"
import ReceiverMessage from "../components/ReceiverMessage"
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "@firebase/firestore"
import { db } from "../firebase"

const MessageScreen = () => {
    const { params: { matchDetails } } = useRoute();
    const { user } = useAuth();

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(
        () =>
            onSnapshot(
                query(
                    collection(db, "matches", matchDetails.id, "messages"),
                    orderBy("timestamp", "desc")
                ),
                (snapshot) =>
                    setMessages(
                        snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }))
                    )
            ),
        [matchDetails, db]
    )

    const sendMessage = () => {
        addDoc(collection(db, "matches", matchDetails.id, "messages"), {
            userId: user.uid,
            displayName: user.displayName,
            photoURL: matchDetails.users[user.uid].photoURL,
            message: input,
            timestamp: serverTimestamp()
        })

        setInput("");
    }

    return (
        <SafeAreaView style={tw("flex-1")}>
            <Header title={getMatchedUserInfo(matchDetails.users, user.uid).displayName} callEnabled />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={tw("flex-1")}
                keyboardVerticalOffset={10}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <FlatList
                        style={tw("pl-4")}
                        inverted={-1}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item: message }) =>
                            message.userId === user.uid ? (
                                <SenderMessage key={message.id} message={message} />
                            ) : (
                                <ReceiverMessage key={message.id} message={message} />
                            )
                        }
                    />
                </TouchableWithoutFeedback>
                <View style={tw("flex-row justify-between items-center border-t border-gray-200 px-5 py-2")}>
                    <TextInput
                        style={tw("h-10 justify-center text-lg flex-1")}
                        placeholder="Send Message..."
                        onChangeText={setInput}
                        onSubmitEditing={sendMessage}
                        returnKeyType="send"
                        value={input}
                    />
                    <Button onPress={sendMessage} title="Send" color="#ff5864" />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default MessageScreen