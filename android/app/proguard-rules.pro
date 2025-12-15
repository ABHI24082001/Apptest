############################################################
# ⚙️ React Native + VisionCamera + Reanimated (Optimized)
############################################################

# ===== Core React Native =====
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }
-dontwarn com.facebook.react.**

# ===== Hermes =====
-keep class com.facebook.hermes.unicode.** { *; }

# ===== Reanimated & Gesture Handler =====
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.**

# ===== VisionCamera =====
-keep class com.mrousavy.camera.** { *; }
-keep class com.mrousavy.** { *; }
-dontwarn com.mrousavy.**

# ===== ONNX Runtime (AI / Face Detection) =====
-keep class ai.onnxruntime.** { *; }
-keep class com.microsoft.onnxruntime.** { *; }
-dontwarn ai.onnxruntime.**

# ===== Coil v3 =====
-keep class coil3.** { *; }
-dontwarn coil3.**

# ===== OkHttp / Networking =====
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# ===== AsyncStorage =====
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ===== Geolocation =====
-keep class com.reactnativecommunity.geolocation.** { *; }

# ===== Background Service =====
-keep class com.asterinet.react.bgservice.** { *; }

# ===== Image Picker =====
-keep class com.reactnativecommunity.imagepicker.** { *; }
-dontwarn com.imagepicker.**

# ===== RNFS =====
-keep class com.rnfs.** { *; }
-dontwarn com.rnfs.**

# ===== Image Resizer =====
-keep class fr.bamlab.rnimageresizer.** { *; }
-dontwarn fr.bamlab.rnimageresizer.**

# ===== Lottie =====
-keep class com.airbnb.lottie.** { *; }
-dontwarn com.airbnb.lottie.**

# ===== Linear Gradient =====
-keep class com.BV.LinearGradient.** { *; }

# ===== Vector Icons =====
-keep class com.oblador.vectoricons.** { *; }

# ===== Kotlin =====
-keep class kotlin.Metadata { *; }

# ===== JS Bridge / Native Modules =====
-keepattributes *Annotation*
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }

-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
    native <methods>;
}

# ===== Application Code (ONLY your app) =====
-keep class com.cloudtree.hrms.** { *; }

# ===== Concurrency & Buffers =====
-keep class java.util.concurrent.** { *; }
-keep class java.nio.** { *; }
-dontwarn java.util.concurrent.**
-dontwarn java.nio.**

# ===== Suppress Common Android Warnings =====
-dontwarn javax.annotation.**
-dontwarn org.codehaus.mojo.animal_sniffer.*

############################################################
# 🚫 Fix R8 Missing JVM / Test-only Classes (SAFE)
############################################################
-dontwarn java.lang.management.**
-dontwarn javax.naming.**
-dontwarn javax.tools.**
-dontwarn org.mockito.**
-dontwarn org.opentest4j.**
-dontwarn net.bytebuddy.**
-dontwarn org.spongycastle.**

############################################################
# ✅ Notes:
# ✔ Safe for Play Store
# ✔ VisionCamera + ONNX compatible
# ✔ R8 / minifyRelease enabled
# ✔ No JVM/Test class crashes
############################################################
