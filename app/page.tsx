import InterviewPractice from "./components/InterviewPractice"
import styles from "./Home.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Interview Practice Assistant</h1>
        <p className={styles.description}>Enhance your interview skills with AI-powered feedback</p>
        <InterviewPractice />
        <p className={styles.note}>
          Note: This application works best in Chrome, Edge, or Firefox on desktop. Some mobile browsers may not fully
          support speech recognition.
        </p>
      </main>
    </div>
  )
}

