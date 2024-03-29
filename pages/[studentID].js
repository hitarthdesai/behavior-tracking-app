import Head from "next/head";
import { StudentProfile } from "../components/StudentProfile";

import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StudentPage({ studentFound, studentData }) {
	if (!studentFound) {
		return <>NOT FOUND</>;
	}

	return (
		<>
			<Head>
				<title>Create Next App</title>
				<meta
					name="description"
					content="Generated by create next app"
				/>
			</Head>
			<StudentProfile studentData={studentData} />
		</>
	);
}

export async function getServerSideProps(context) {
	const { params } = context;
	const { studentID } = params;

	const studentDoc = doc(db, `students/${studentID}`);
	const studentSnapshot = await getDoc(studentDoc);
	const doesStudentExist = studentSnapshot.exists();
	if (!doesStudentExist)
		return {
			props: {
				studentFound: doesStudentExist,
			},
		};

	const studentData = studentSnapshot.data();
	const arrayOfBehaviorIDs = studentData.behaviors;
	if (!arrayOfBehaviorIDs || arrayOfBehaviorIDs.length === 0) {
		const newStudentData = {
			...studentData,
			studentID,
			behaviors: {},
		};
		return {
			props: {
				studentFound: true,
				studentData: newStudentData,
			},
		};
	}
	let arrayOfBehaviorData = [];
	for (const behaviorID of arrayOfBehaviorIDs) {
		const behaviorDoc = doc(db, `behaviors/${behaviorID}`);
		const behaviorSnapshot = await getDoc(behaviorDoc);
		const behaviorData = behaviorSnapshot.data();
		behaviorData.time = behaviorData.time.toJSON();
		arrayOfBehaviorData.push({ ...behaviorData, behaviorID });
	}

	const newStudentData = {
		...studentData,
		studentID,
		behaviors: arrayOfBehaviorData,
	};
	return {
		props: {
			studentFound: true,
			studentData: newStudentData,
		},
	};
}
