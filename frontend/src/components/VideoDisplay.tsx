export interface Video {
  id: number
  videoTitle: string
  videoUrl: string | null
  creator: { username: string }
  likeCount?: number
  dislikeCount?: number
  _count?: {
    videoLikes?: number
    videoDislikes?: number
  }
  codePane: {
    problemTitle: string
    problemDescription: string
    testCases?: Array<{ input: string; output?: string; expectedOutput?: string }>
  }
}

interface VideoDisplayProps {
  videos: Video[]
  selectedVideoId?: number | null
  onVideoChange: (video: Video) => void
}

export default function VideoDisplay({ videos, selectedVideoId, onVideoChange }: VideoDisplayProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="p-10 text-muted-foreground text-center flex items-center justify-center h-full">
        No videos found. Upload one to start playing!
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {videos.map((video) => {
        const isActive = selectedVideoId === video.id
        return (
          <button
            key={video.id}
            type="button"
            onClick={() => onVideoChange(video)}
            className={`group w-full overflow-hidden rounded-3xl border transition-all duration-200 text-left ${
              isActive
                ? 'border-primary bg-primary/10 shadow-[0_0_0_2px_rgba(249,115,22,0.25)]'
                : 'border-border bg-secondary/30 hover:border-primary hover:bg-secondary/60'
            }`}
          >
            <div className="relative aspect-[9/16] max-h-[420px] bg-slate-950 overflow-hidden">
              {video.videoUrl ? (
                <video
                  src={video.videoUrl}
                  preload="metadata"
                  muted
                  loop
                  playsInline
                  onError={() => {
                    console.warn('Video preview failed (non-fatal):', video.videoUrl)
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No video preview
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">@{video.creator?.username ?? 'creator'}</p>
                <p className="mt-1 text-sm font-semibold leading-tight">{video.videoTitle || 'Untitled Video'}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Tap to open</p>
              <p className="mt-3 text-sm text-foreground line-clamp-2">{video.codePane?.problemTitle ?? 'Coding Challenge'}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}