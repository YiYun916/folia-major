import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X } from 'lucide-react';

/* ============================================================
 * 声屿 Folia 公告弹窗（风格对齐 Folia 自带弹窗：深色 zinc 卡片 + 毛玻璃 + 圆角 + 动画）
 *
 * ① 改内容：改下面的 NOTICE_TITLE / NOTICE_BODY
 * ② 改时机：SHOW_EVERY_LOAD
 *    - true  = 每次打开都弹
 *    - false = 每个版本只弹一次（用 localStorage 记住）
 * ============================================================ */
const NOTICE_TITLE = '声屿 Folia';
const NOTICE_BODY = `声屿 Folia 由 GitHub 开源项目 Folia（原作者 chthollyphile，仓库 folia-major）二次开发而来，感谢原作者的无私开源。

Folia 是一个动态歌词播放器：支持网易云、酷狗、QQ 音乐等多平台曲库，歌词随节奏实时滚动，还能用 AI 自动生成配合封面的主题配色；界面简洁、深浅色自适配，网页和手机都能流畅使用。

声屿在原版基础上做了本地化与体验优化，希望能陪你把每一首歌都听得更舒服。`;
const SHOW_EVERY_LOAD = true; // true=每次打开都弹；false=每个版本只弹一次
const NOTICE_STORAGE_KEY = 'folia_notice_seen_version';

const FoliaNoticeModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let timer: number;
        if (SHOW_EVERY_LOAD) {
            // 稍等首帧，避免和启动遮罩/首屏动画打架
            timer = window.setTimeout(() => setIsOpen(true), 900);
        } else {
            // 每个版本只弹一次
            const appVersion = typeof __APP_VERSION__ === 'undefined' ? null : __APP_VERSION__;
            if (appVersion && localStorage.getItem(NOTICE_STORAGE_KEY) === appVersion) {
                return;
            }
            timer = window.setTimeout(() => setIsOpen(true), 900);
        }
        return () => window.clearTimeout(timer);
    }, []);

    const close = () => {
        if (!SHOW_EVERY_LOAD) {
            const appVersion = typeof __APP_VERSION__ === 'undefined' ? null : __APP_VERSION__;
            if (appVersion) {
                localStorage.setItem(NOTICE_STORAGE_KEY, appVersion);
            }
        }
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
                    onClick={close}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900/95 border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl backdrop-blur-md relative"
                    >
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 p-2 rounded-full transition-colors opacity-50 hover:opacity-100 hover:bg-white/10 text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <Megaphone size={30} className="text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-4 text-white">
                            {NOTICE_TITLE}
                        </h2>

                        <div className="mb-8">
                            <p className="text-center text-zinc-300 opacity-90 leading-relaxed whitespace-pre-line">
                                {NOTICE_BODY}
                            </p>
                        </div>

                        <button
                            onClick={close}
                            className="w-full py-3 px-6 rounded-full font-medium text-sm transition-colors bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                        >
                            我知道了
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FoliaNoticeModal;

