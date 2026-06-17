"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Chat from "./components/chat";

type ToolCall = {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string;
    };
};

const Home = () => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userToken = params.get('user_token');
        setToken(userToken);
        if (!userToken) {
            console.warn('No user token found in URL parameters');
        }
    }, []);

    const functionCallHandler = async (call: ToolCall) => {
        if (!token) {
            console.error('No token available');
            return;
        }

        try {
            if (call?.function?.name === "find_content") {
                const { query, type } = JSON.parse(call.function.arguments);
                const params = new URLSearchParams({ type, 'q[title_cont]': query });
                const res = await fetch(`/api/posts?${params}`);
                const data = await res.json();
                return JSON.stringify(data);
            }
        } catch (error) {
            console.error('Function call handler error:', error);
        }
    };

    return (
        <main className={styles.main}>
            <Chat functionCallHandler={functionCallHandler}/>
        </main>
    );
};

export default Home;
