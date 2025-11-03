# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep ONNX Runtime classes
-keep class ai.onnxruntime.** { *; }

# Keep ImagePicker classes
-keep class com.imagepicker.** { *; }

# Keep ImagePicker classes
-keep class com.imagepicker.** { *; }

# Keep AsyncStorage classes
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep Geolocation classes
-keep class com.reactnativecommunity.geolocation.** { *; }

# Keep Background Service classes
-keep class com.asterinet.react.bgservice.** { *; }

# Keep Promise-related classes
-keep class java.util.concurrent.** { *; }
-keep class java.util.function.** { *; }

# Prevent obfuscation of native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Don't warn about missing classes
-dontwarn java.util.concurrent.**
-dontwarn java.util.function.**
-dontwarn javax.annotation.**

# Keep your model classes
-keep class ** { *; }
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
