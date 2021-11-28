import React, { useEffect, useState } from "react"
import { View, Text, Image, TouchableOpacity, Platform, TextInput } from "react-native"
import tw from "tailwind-rn"
import useAuth from "../hooks/useAuth"
import * as ImagePicker from "expo-image-picker"
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage"
import { db, storage } from "../firebase"
import { doc, setDoc, serverTimestamp } from "@firebase/firestore"
import { useNavigation } from "@react-navigation/core"

const ModalScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [imageUrl, setImageUrl] = useState("https://i.ibb.co/nPbJWTD/default-profile-pic.jpg");
    const [job, setJob] = useState("");
    const [age, setAge] = useState("");

    const incompleteForm = !imageUrl || !job || !age

    useEffect(
        () =>
            (async () => {
                if (Platform.OS !== "web") {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== "granted") {
                        alert("Sorry, we need camera roll permissions to make this work!");
                    }
                }
            })(),
        []
    )

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        })

        if (!result.cancelled) setImageUrl(result.uri);
    }

    const updateUserProfile = async () => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.onload = () => {
                resolve(xhr.response);
            }

            xhr.onerror = (e) => {
                console.log(e);
                reject(new TypeError("Network request failed"));
            }

            xhr.responseType = "blob"
            xhr.open("GET", imageUrl, true);
            xhr.send(null);
        })

        const imageRef = ref(storage, `${user.displayName} Profile Picture - Date: ${new Date().toUTCString()}`);
        const result = await uploadBytes(imageRef, blob);

        blob.close();

        return await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            displayName: user.displayName,
            photoURL: await getDownloadURL(imageRef),
            job,
            age,
            timestamp: serverTimestamp()
        })
            .then(() => navigation.navigate("Home"))
            .catch((error) => alert(error.message))
    }

    return (
        <View style={tw("flex-1 items-center pt-1")}>
            <Image
                source={{ uri: "https://links.papareact.com/2pf" }}
                style={tw("h-20 w-full")}
                resizeMode="contain"
            />

            <Text style={tw("text-xl text-gray-500 p-2 font-bold")}>Welcome, {user.displayName}</Text>

            <Text style={tw("text-center p-4 font-bold text-red-400")}>Step 1: The Profile Pic</Text>
            <Image
                source={{ uri: imageUrl }}
                style={tw("h-24 w-24 rounded-full")}
            />
            <TouchableOpacity
                onPress={pickImage}
                style={tw("bg-red-400 rounded-xl py-2 px-3 mt-4")}
            >
                <Text style={tw("text-base font-semibold text-white")}>Choose Profile Pic</Text>
            </TouchableOpacity>

            <Text style={tw("text-center p-4 font-bold text-red-400")}>Step 2: The Job</Text>
            <TextInput
                style={tw("text-center text-xl pb-2")}
                placeholder="Enter your occupation"
                onChangeText={setJob}
                value={job}
            />

            <Text style={tw("text-center p-4 font-bold text-red-400")}>Step 3: The Age</Text>
            <TextInput
                style={tw("text-center text-xl pb-2")}
                placeholder="Enter your age"
                keyboardType="numeric"
                onChangeText={setAge}
                value={age}
                maxLength={2}
            />

            <TouchableOpacity
                disabled={incompleteForm}
                onPress={updateUserProfile}
                style={[
                    tw("w-64 p-3 rounded-xl absolute bottom-10"),
                    incompleteForm ? tw("bg-gray-400") : tw("bg-red-400")
                ]}
            >
                <Text style={tw("text-center text-white text-xl")}>Update Profile</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ModalScreen