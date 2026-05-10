class GlobalStore {
    constructor() {
        this.completedTopics = new Set();
        this.settings = {
            hapticIntensity: 'medium', // 'low', 'medium', 'high'
            audioSpeed: 'normal'
        };
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l());
    }

    markTopicComplete(topic) {
        this.completedTopics.add(topic);
        this.notify();
    }

    getCompletedCount() {
        return this.completedTopics.size;
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.notify();
    }
}

const storeInstance = new GlobalStore();
export default storeInstance;
