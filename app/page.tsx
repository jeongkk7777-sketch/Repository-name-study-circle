"use client";

import { useEffect, useState } from "react";

type StudyRecord = {
  date: string;
  subject: string;
  task: string;
  studyMinutes: number;
};

export default function Home() {
  const [step, setStep] = useState(0);

  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [goalMinutes, setGoalMinutes] = useState(60);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [studyHistory, setStudyHistory] = useState<StudyRecord[]>([]);

  // 기록 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem("studyHistory");

    if (savedHistory) {
      setStudyHistory(JSON.parse(savedHistory));
    }

    const savedStudy = localStorage.getItem("currentStudy");

    if (savedStudy) {
      const data = JSON.parse(savedStudy);

      setSubject(data.subject || "");
      setTask(data.task || "");
      setGoalMinutes(data.goalMinutes || 60);
      setSeconds(data.seconds || 0);

      if (data.subject || data.task) {
        setStep(4);
      }
    }
  }, []);

  // 기록 저장
  useEffect(() => {
    localStorage.setItem(
      "studyHistory",
      JSON.stringify(studyHistory)
    );
  }, [studyHistory]);

  // 현재 공부 상태 저장
  useEffect(() => {
    localStorage.setItem(
      "currentStudy",
      JSON.stringify({
        subject,
        task,
        goalMinutes,
        seconds,
      })
    );
  }, [subject, task, goalMinutes, seconds]);

  // 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (running) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [running]);

  const safeGoalMinutes =
    goalMinutes <= 0 ? 1 : goalMinutes;

  const progress = Math.max(
    0,
    100 - (seconds / (safeGoalMinutes * 60)) * 100
  );

  const remainSeconds = Math.max(
    0,
    safeGoalMinutes * 60 - seconds
  );

  const remainMinutes = Math.floor(remainSeconds / 60);
  const remainOnlySeconds = remainSeconds % 60;

  // 목표 달성
  useEffect(() => {
    if (remainSeconds === 0 && running) {
      setRunning(false);
      alert("🎉 목표 시간을 달성했습니다!");
    }
  }, [remainSeconds, running]);

  const add15Minutes = () => {
    setGoalMinutes((prev) => prev + 15);
  };

  const resetStudy = () => {
    setRunning(false);
    setSeconds(0);

    setSubject("");
    setTask("");
    setGoalMinutes(60);

    localStorage.removeItem("currentStudy");

    setStep(0);
  };

  const completeStudy = () => {
    const today = new Date().toISOString().split("T")[0];

    const newRecord: StudyRecord = {
      date: today,
      subject,
      task,
      studyMinutes: Math.floor(seconds / 60),
    };

    setStudyHistory((prev) => [...prev, newRecord]);

    alert("🎉 공부 기록 저장 완료!");

    resetStudy();
  };

  // 홈
  if (step === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <button
          onClick={() => setStep(1)}
          className="w-72 h-72 rounded-full bg-sky-200 text-4xl font-bold shadow-xl"
        >
          공부 시작
        </button>

        <div className="mt-10 text-center">
          <h2 className="text-xl font-bold">
            📚 저장된 기록 {studyHistory.length}개
          </h2>

          <button
            onClick={() => setStep(99)}
            className="mt-4 rounded-lg bg-purple-300 px-4 py-2"
          >
            📅 캘린더 보기
          </button>
        </div>
      </main>
    );
  }

  // 캘린더
  if (step === 99) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const studiedDays = studyHistory
      .filter((record) => {
        const date = new Date(record.date);

        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .map((record) => {
        const date = new Date(record.date);
        return date.getDate();
      });

    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-8 text-3xl font-bold">
          📅 공부 캘린더
        </h1>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }).map((_, index) => {
            const day = index + 1;

            const studied =
              studiedDays.includes(day);

            return (
              <div
                key={day}
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  studied
                    ? "bg-sky-400 text-white"
                    : "bg-gray-200"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setStep(0)}
          className="mt-8 rounded-lg bg-gray-300 px-4 py-2"
        >
          홈으로
        </button>
      </main>
    );
  }

  // 과목 입력
  if (step === 1) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">
          과목 입력
        </h1>

        <input
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
          placeholder="예: 수학"
          className="w-64 rounded border p-3 text-center"
        />

        <button
          onClick={() => setStep(2)}
          className="rounded-lg bg-sky-300 px-6 py-3"
        >
          다음
        </button>
      </main>
    );
  }

  // 할 일 입력
  if (step === 2) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">
          할 일 입력
        </h1>

        <input
          value={task}
          onChange={(e) =>
            setTask(e.target.value)
          }
          placeholder="예: 영어 단어 암기"
          className="w-64 rounded border p-3 text-center"
        />

        <button
          onClick={() => setStep(3)}
          className="rounded-lg bg-sky-300 px-6 py-3"
        >
          다음
        </button>
      </main>
    );
  }

  // 목표 시간 입력
  if (step === 3) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">
          목표 시간(분)
        </h1>

        <input
          type="number"
          min={1}
          value={goalMinutes}
          onChange={(e) =>
            setGoalMinutes(
              Math.max(1, Number(e.target.value))
            )
          }
          className="w-40 rounded border p-3 text-center"
        />

        <button
          onClick={() => setStep(4)}
          className="rounded-lg bg-sky-300 px-6 py-3"
        >
          공부 시작
        </button>
      </main>
    );
  }

  // 타이머
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <p className="text-xl font-bold">
        {subject}
      </p>

      <p className="mb-6 text-gray-500">
        {task}
      </p>

      <button
        onClick={() => setRunning(!running)}
        className="h-64 w-64 rounded-full text-3xl font-bold shadow-lg"
        style={{
          background: `conic-gradient(
            #7dd3fc ${progress}%,
            #e5e7eb ${progress}%
          )`,
        }}
      >
        {running
          ? "⏸ 일시정지"
          : "▶ 시작"}
      </button>

      <p className="mt-8 text-4xl font-bold">
        {remainMinutes}분 {remainOnlySeconds}초
      </p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={add15Minutes}
          className="rounded-lg bg-green-300 px-4 py-2"
        >
          +15분
        </button>

        <button
          onClick={completeStudy}
          className="rounded-lg bg-blue-300 px-4 py-2"
        >
          🏁 공부 완료
        </button>

        <button
          onClick={resetStudy}
          className="rounded-lg bg-red-300 px-4 py-2"
        >
          중도 종료
        </button>
      </div>
    </main>
  );
}