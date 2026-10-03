package com.meshsight.app

import android.graphics.Bitmap
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView

/**
 * Backs the multi-image swipe gallery ([androidx.viewpager2.widget.ViewPager2]).
 *
 * Each page shows one bitmap scaled to fit without cropping. Callers keep the
 * original list; this adapter holds its own copy and must be refreshed with
 * [setImages] whenever it changes.
 */
class ImagePagerAdapter : RecyclerView.Adapter<ImagePagerAdapter.ImageViewHolder>() {

    private val bitmaps = mutableListOf<Bitmap>()

    /** Replaces the full image set and notifies the pager. */
    fun setImages(images: List<Bitmap>) {
        val start = bitmaps.size
        bitmaps.clear()
        bitmaps.addAll(images)
        notifyItemRangeRemoved(0, start)
        notifyItemRangeInserted(0, images.size)
    }

    fun getImage(position: Int): Bitmap? = bitmaps.getOrNull(position)

    override fun getItemCount(): Int = bitmaps.size

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ImageViewHolder {
        val imageView = ImageView(parent.context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            // FIT_CENTER mirrors OverlayView's scaling so overlays stay aligned
            scaleType = ImageView.ScaleType.FIT_CENTER
            setBackgroundColor(android.graphics.Color.BLACK)
        }
        return ImageViewHolder(imageView)
    }

    override fun onBindViewHolder(holder: ImageViewHolder, position: Int) {
        (holder.itemView as ImageView).setImageBitmap(bitmaps[position])
    }

    class ImageViewHolder(view: android.view.View) : RecyclerView.ViewHolder(view)
}
