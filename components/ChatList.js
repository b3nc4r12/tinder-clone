import React, { useEffect, useState } from "react"
import { View, Text, FlatList } from "react-native"
import { onSnapshot, collection, query, where } from "@firebase/firestore"
import { db } from "../firebase"
import useAuth from "../hooks/useAuth"
import tw from "tailwind-rn"
import ChatRow from "./ChatRow"

const ChatList = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);

    useEffect(
        () =>
            onSnapshot(
                query(
                    collection(db, "matches"),
                    where("usersMatched", "array-contains", user.uid)
                ),
                (snapshot) =>
                    setMatches(
                        snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }))
                    )
            ),
        [db, user]
    )

    return (
        matches.length > 0 ? (
            <FlatList
                style={tw("h-full")}
                data={matches}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatRow matchDetails={item} />}
            />
        ) : (
            <View style={tw("p-5")}>
                <Text style={tw("text-center text-lg")}>No matches at the moment 😥</Text>
            </View>
        )
    )
}

export default ChatList