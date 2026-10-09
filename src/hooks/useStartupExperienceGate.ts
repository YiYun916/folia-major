import { useCallback, useEffect, useState } from 'react';
import { USER_GUIDE_AUTO_OPEN_VERSION } from '../components/modal/userGuideContent';
import { requestPlaybackEntryViewPrompt, usePlaybackEntryViewStore } from '../stores/usePlaybackEntryViewStore';
import { useSettingsModalStore } from '../stores/useSettingsModalStore';

// src/hooks/useStartupExperienceGate.ts

const LAST_SEEN_RELEASE_NOTES_VERSION_STORAGE_KEY = 'folia_last_seen_guide_version';

export type StartupExperienceStep = 'release-notes' | 'playback-entry-view' | 'ponder' | null;

type StartupExperienceState = {
    isCurrentRelease: boolean;
    hasSeenPonder: boolean;
    hasFinishedThisRelease: boolean;
    hasSeenReleaseNotes: boolean;
    isReleaseNotesOpen: boolean;
    hasChosenPlaybackEntryView: boolean;
    isPlaybackEntryViewPromptOpen: boolean;
    isPonderOnboardingOpen: boolean;
};

export const resolveStartupExperienceStep = ({
    isCurrentRelease,
    hasSeenPonder,
    hasFinishedThisRelease,
    hasSeenReleaseNotes,
    isReleaseNotesOpen,
    hasChosenPlaybackEntryView,
    isPlaybackEntryViewPromptOpen,
    isPonderOnboardingOpen,
}: StartupExperienceState): StartupExperienceStep => {
    if (!isCurrentRelease || hasFinishedThisRelease || isReleaseNotesOpen || isPlaybackEntryViewPromptOpen || isPonderOnboardingOpen) {
        return null;
    }
    if (!hasSeenReleaseNotes) {
        return 'release-notes';
    }
    if (!hasChosenPlaybackEntryView) {
        return 'playback-entry-view';
    }
    return hasSeenPonder ? null : 'ponder';
};

const readLastSeenReleaseNotesVersion = (): string | null => (
    typeof window === 'undefined'
        ? null
        : localStorage.getItem(LAST_SEEN_RELEASE_NOTES_VERSION_STORAGE_KEY)
);

export const useStartupExperienceGate = () => {
    const lastSeenPonderVersion = useSettingsModalStore(state => state.lastSeenGuideVersion);
    const isPonderOnboardingOpen = useSettingsModalStore(state => state.isUserGuideModalOpen);
    const setIsPonderOnboardingOpen = useSettingsModalStore(state => state.setIsUserGuideModalOpen);
    const hasChosenPlaybackEntryView = usePlaybackEntryViewStore(state => state.hasChosenPlaybackEntryView);
    const isPlaybackEntryViewPromptOpen = usePlaybackEntryViewStore(state => state.isPlaybackEntryViewPromptOpen);
    const [lastSeenReleaseNotesVersion, setLastSeenReleaseNotesVersion] = useState(readLastSeenReleaseNotesVersion);
    const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
    const appVersion = typeof __APP_VERSION__ === 'undefined' ? null : __APP_VERSION__;

    const nextStep = resolveStartupExperienceStep({
        isCurrentRelease: false, // 禁用启动弹窗：版本更新、播放入口引导都不弹
        hasSeenPonder: lastSeenPonderVersion !== null,
        hasFinishedThisRelease: Boolean(appVersion && lastSeenPonderVersion === appVersion),
        hasSeenReleaseNotes: Boolean(appVersion && lastSeenReleaseNotesVersion === appVersion),
        isReleaseNotesOpen,
        hasChosenPlaybackEntryView,
        isPlaybackEntryViewPromptOpen,
        isPonderOnboardingOpen,
    });

    useEffect(() => {
        if (nextStep === 'release-notes') {
            setIsReleaseNotesOpen(true);
        } else if (nextStep === 'playback-entry-view') {
            requestPlaybackEntryViewPrompt();
        } else if (nextStep === 'ponder') {
            setIsPonderOnboardingOpen(true);
        }
    }, [nextStep, setIsPonderOnboardingOpen]);

    const closeReleaseNotes = useCallback(() => {
        if (appVersion) {
            localStorage.setItem(LAST_SEEN_RELEASE_NOTES_VERSION_STORAGE_KEY, appVersion);
            setLastSeenReleaseNotesVersion(appVersion);
        }
        setIsReleaseNotesOpen(false);
    }, [appVersion]);

    return { isReleaseNotesOpen, closeReleaseNotes };
};
