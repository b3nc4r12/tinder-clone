import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, Image, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/core"
import useAuth from "../hooks/useAuth"
import tw from "tailwind-rn"
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons"
import Swiper from "react-native-deck-swiper"
import { collection, doc, onSnapshot, setDoc, query, where, getDocs, getDoc, serverTimestamp } from "@firebase/firestore"
import { db } from "../firebase"
import { generateId } from "../lib/generateId"

const DUMMY_DATA = [
    {
        firstName: "Sonny",
        lastName: "Sangha",
        job: "Software Developer",
        photoURL: "https://avatars.githubusercontent.com/u/24712956?v=4",
        age: 27
    },
    {
        firstName: "Elon",
        lastName: "Musk",
        job: "Software Developer",
        photoURL:
            "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
        age: 40
    },
    {
        firstName: "Sonny",
        lastName: "Sangha",
        job: "Software Developer",
        photoURL:
            "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
        age: 21
    }
]

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const swiperRef = useRef(null);

    useLayoutEffect(
        () =>
            onSnapshot(doc(db, "users", user.uid), (doc) => {
                if (!doc.exists()) navigation.navigate("Modal")
            }),
        []
    )

    useEffect(() => {
        let unsub

        const fetchCards = async () => {
            const passes = await getDocs(collection(db, "users", user.uid, "passes"))
                .then((snapshot) => snapshot.docs.map((doc) => doc.id))

            const swipes = await getDocs(collection(db, "users", user.uid, "swipes"))
                .then((snapshot) => snapshot.docs.map((doc) => doc.id))

            const passedUserIds = passes.length > 0 ? passes : ["test"]
            const swipedUserIds = swipes.length > 0 ? swipes : ["test"]

            unsub = onSnapshot(
                query(
                    collection(db, "users"),
                    where("id", "not-in", [...passedUserIds, ...swipedUserIds])
                ),
                (snapshot) => {
                    setProfiles(
                        snapshot.docs
                            .filter((doc) => doc.id !== user.uid)
                            .map((doc) => ({
                                id: doc.id,
                                ...doc.data()
                            }))
                    )
                }
            )
        }

        fetchCards();
        return unsub
    }, [db])

    const swipeLeft = async (cardIndex) => {
        if (!profiles[cardIndex]) return

        const userSwiped = profiles[cardIndex]
        console.log(`You swiped PASS on ${userSwiped.displayName}`)

        await setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
    }

    const swipeRight = async (cardIndex) => {
        if (!profiles[cardIndex]) return

        const userSwiped = profiles[cardIndex]
        const loggedInProfile = await (await getDoc(doc(db, "users", user.uid))).data();

        getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then((document) => {
            if (document.exists()) {
                // user has matched with you before you matched with them
                console.log(`You MATCHED with ${userSwiped.displayName} (${userSwiped.job})`)

                setDoc(doc(db, "users", user.uid, "swipes", userSwiped.id), userSwiped);

                // CREATE A MATCH
                setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
                    users: {
                        [user.uid]: loggedInProfile,
                        [userSwiped.id]: userSwiped
                    },
                    usersMatched: [user.uid, userSwiped.id],
                    timestamp: serverTimestamp()
                })

                navigation.navigate("Match", { loggedInProfile, userSwiped })
            } else {
                // first interaction between users
                console.log(`You swiped on ${userSwiped.displayName} (${userSwiped.job})`)
                setDoc(doc(db, "users", user.uid, "swipes", userSwiped.id), userSwiped);
            }
        })
    }

    return (
        <SafeAreaView style={tw("flex-1")}>
            {/* Header */}
            <View style={tw("items-center relative")}>
                <TouchableOpacity
                    style={tw("absolute left-5 top-3")}
                    onPress={logout}
                >
                    <Image
                        source={{ uri: user.photoURL }}
                        style={tw("h-10 w-10 rounded-full")}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={tw("h-14 w-14")}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate("Chat")}
                    style={tw("absolute right-5 top-3")}
                >
                    <Ionicons name="chatbubbles-sharp" size={30} color="#FF5864" />
                </TouchableOpacity>
            </View>

            {/* Cards */}
            <View style={tw("flex-1 -mt-6")}>
                <Swiper
                    ref={swiperRef}
                    cards={profiles}
                    stackSize={5}
                    cardIndex={0}
                    verticalSwipe={false}
                    animateCardOpacity
                    containerStyle={tw("bg-transparent")}
                    cardStyle={styles.cardShadow}
                    onSwipedLeft={swipeLeft}
                    onSwipedRight={swipeRight}
                    backgroundColor={"#4FD0E9"}
                    overlayLabels={{
                        left: {
                            title: "NOPE",
                            style: {
                                label: {
                                    textAlign: "right",
                                    color: "red"
                                }
                            }
                        },
                        right: {
                            title: "MATCH",
                            style: {
                                label: {
                                    color: "#4DED30"
                                }
                            }
                        }
                    }}
                    renderCard={(card, index) => card ? (
                        <View key={index} style={tw("relative bg-white h-3/4 rounded-xl")}>
                            <Image
                                source={{ uri: card.photoURL }}
                                style={tw("absolute top-0 h-full w-full rounded-xl")}
                            />

                            <View style={tw("absolute bottom-0 bg-white w-full flex-row justify-between items-center h-20 px-6 py-2 rounded-b-xl")}>
                                <View>
                                    <Text style={tw("text-xl font-bold")}>
                                        {card.displayName}
                                    </Text>
                                    <Text>{card.job}</Text>
                                </View>
                                <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={[tw("relative bg-white h-3/4 rounded-xl justify-center items-center"), styles.cardShadow]}>
                            <Text style={tw("font-bold pb-5")}>No more profiles</Text>
                            <Image
                                style={tw("h-20 w-full")}
                                height={100}
                                width={100}
                                source={{ uri: "https://links.papareact.com/6gb" }}
                            />
                        </View>
                    )}
                />
            </View>

            {/* Buttons */}
            <View style={tw("flex-row justify-evenly")}>
                <TouchableOpacity onPress={() => swiperRef.current.swipeLeft()} style={tw("items-center justify-center rounded-full w-16 h-16 bg-red-200")}>
                    <Entypo name="cross" size={24} color="red" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => swiperRef.current.swipeRight()} style={tw("items-center justify-center rounded-full w-16 h-16 bg-green-200")}>
                    <AntDesign name="heart" size={24} color="green" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2
    }
})