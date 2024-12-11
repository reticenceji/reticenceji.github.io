---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# 虚拟文件系统

关于 VFS，有一篇 [不错的介绍](https://www.kernel.org/doc/html/latest/filesystems/vfs.html#struct-file-system-type)。这是 2.6.39 的代码，很简洁

## Virtual File System Data Structure

**超级块**、**Inode**、**目录项**、**文件对象** 被称为文件系统的四大数据结构。无论底层的真实文件系统中是否有这些数据结构，在 VFS 中都会有对应的数据结构。

超级块 ([struct super_block](https://elixir.bootlin.com/linux/latest/source/include/linux/fs.h#L1465)) 代表了整个文件系统，超级块是文件系统的控制块，有整个文件系统信息，一个文件系统所有的 inode 都要连接到超级块上，可以说，**一个超级块就代表了一个文件系统**。

```c
// 这个list上边的就是所有的在linux上记录的文件系统
struct list_head    s_list;  
// 挂载点
struct dentry  *s_root;
// 文件系统类型 也就是当前这个文件系统属于哪个类型 ext4/fat32
// 一个文件系统类型下可以包括很多文件系统即很多的super_block
struct file_system_type *s_type;
// Filesystem private info 也就是说你可以在这里存一些你想要的自定义的东西
void   *s_fs_info; 
```

Inode([struct inode](https://elixir.bootlin.com/linux/latest/source/include/linux/fs.h#L623)) 保存的其实是实际的数据的一些信息，这些信息称为“元数据”(也就是对文件属性的描述)。例如：文件大小，设备标识符，用户标识符，用户组标识符，文件模式，扩展属性，文件读取或修改的时间戳，链接数量，指向存储该内容的磁盘区块的指针，文件分类等等。

```c
// 这个就是我们平时看到的drwxrwxr-x的数据
umode_t            i_mode;
// 
union {
    struct hlist_head i_dentry;
    struct rcu_head  i_rcu;
};
struct super_block *i_sb;
// 这就是 inode numebr
unsigned long  i_ino;
// fs or device private pointer 也就是说你可以在这里存一些你想要的自定义的东西
void   *i_private; 
struct address_space *i_mapping;
struct address_space i_data;
```

目录项 ([struct dentry](https://elixir.bootlin.com/linux/latest/source/include/linux/dcache.h#L91))：目录项是 **描述文件** 的逻辑属性，只存在于内存中，并没有实际对应的磁盘上的描述，更确切的说是存在于内存的目录项缓存，为了提高查找性能而设计。注意 **不管是文件夹还是最终的文件**，都是属于目录项，所有的目录项在一起构成一颗庞大的目录树。例如：open 一个文件/home/xxx/yyy.txt，那么/、home、xxx、yyy.txt 都是一个目录项，VFS 在查找的时候，根据一层一层的目录项找到对应的每个目录项的 inode，那么沿着目录项进行操作就可以找到最终的文件。

```c
// small names 文件的名字，还有一个结构是d_name里面有一个指针指向了d_iname
unsigned char d_iname[DNAME_INLINE_LEN]; 
// Where the name belongs to
struct inode *d_inode; 
// 对应的super_block
struct super_block *d_sb; 
// fs-specific data 也就是说你可以在这里存一些你想要的自定义的东西
void *d_fsdata;   
// 下面三个entry可以构成一个树形结构 
// list_head是一个双向链表,指向的是其他d_entry对应的list_head entry，然后再用hack的宏完成指向真正的d_entry
// (struct dentry*)((char *)me->d_child.head -(char *)&((struct dentry *)0)->d_child))
// 对于非目录文件，d_subdirs 就指向他自己（这个entry）
struct dentry *d_parent; /* parent directory 父 */
struct list_head d_child; /* child of parent list 兄 */ 
struct list_head d_subdirs; /* our children 子 */
```

文件对象 ([struct file](https://elixir.bootlin.com/linux/latest/source/include/linux/fs.h#L965))：注意文件对象描述的是进程已经打开的文件。因为一个文件可以被多个进程打开，所以一个文件可以存在多个文件对象。但是由于文件是唯一的，那么 inode 就是唯一的，目录项也是定的。[struct path](https://elixir.bootlin.com/linux/latest/source/include/linux/path.h#L8)

```c
// path是一个简单的结构体，里面有两项，其中一项就是dentry
struct path  f_path;
struct inode *f_inode; /* cached value */
// 一些flag规定文件的可读、可写、可执行权限
fmode_t   f_mode;
const struct file_operations *f_op;
struct address_space *f_mapping;
// 你可以在这里存一些你想要的自定义的东西
void   *private_data;
```

关于他们之间的转换：

- inode -> dentry: 利用 [`hlist_for_each_entry`](https://elixir.bootlin.com/linux/latest/source/include/linux/list.h#L994) 宏遍历 `i_dentry` 字段，可以参考 Linux 中的 [一个例子](https://elixir.bootlin.com/linux/latest/source/fs/dcache.c#L666)。
- dentry -> inode: 利用 [`d_inode`](https://elixir.bootlin.com/linux/latest/source/include/linux/dcache.h#L303) 函数，或者直接使用 `d_inode` 字段。
- path -> dentry: 利用 `dentry` 字段。
- dentry -> char \* 路径: 利用 [`dentry_path`](https://elixir.bootlin.com/linux/latest/source/fs/d_path.c#L371) 函数。
- path -> char \* 路径: 利用 [`d_path`](https://elixir.bootlin.com/linux/latest/source/fs/d_path.c#L264) 函数。
- char \* 路径 -> path: 利用 kern_path 函数。
- superblock -> inode: [`iget_locked`](https://elixir.bootlin.com/linux/v4.20.17/source/fs/inode.c#L1137) 或者 [`iget5_locked`](https://elixir.bootlin.com/linux/v4.20.17/source/fs/inode.c#L1097)。

## Virtual File System Operation

虚拟文件系统是类似于 Trait 一样的东西，肯定是要暴露一些接口供真正的实现。在 C 语言中就是一堆函数指针，有下面这些方法 (这些 struct 是一大堆方法的集合)

- file_system_type -> `mount`: the method to call when a new instance of this filesystem should be mounted
- file_system_type -> `kill_sb`: the method to call when an instance of this filesystem should be shut down
- super_block -> `struct super_operations`: This describes how the VFS can manipulate the superblock of your filesystem
  - statfs:
- inode -> `struct inode_operations`: This describes how the VFS can manipulate an inode in your filesystem.
- dentry -> `struct dentry_operations`: This describes how a filesystem can overload the standard dentry operations.
- file -> `struct file_operations`: This describes how the VFS can manipulate an open file.
- address_space ->`struct address_space_operations`: This describes how the VFS can manipulate mapping of a file to page cache in your filesystem.

所以这些方法都要重写吗？没有默认实现吗？并不是的，有些可以是 NULL，表示不需要或者采用默认实现。[这篇文章](https://www.kernel.org/doc/html/latest/filesystems/vfs.html#struct-file-system-type) 提供了很好的参考，不过如果自己想要实现，需要注意内核版本。

下面的内容是一些零碎的笔记
----

### mount

> mount [-t vfstype] [-o options] [设备名称] [挂载点]

- `挂载点`: 必须是一个已经存在的目录，这个目录可以不为空，但挂载后这个目录下以前的内容将不可用，umount 以后会恢复正常
- `设备名称`: 可以是一个分区，一个 usb 设备，光驱，软盘，网络共享等
- `-t` 指定文件系统的类型，通常不必指定。mount 会自动选择正确的类型。常用类型有：

从代码实现的角度，挂载的过程就是将代表这个文件系统的 "super_block" 结构体，加入由之前已经挂载的所有 filesystems 组成的双向链表中（即 `s_list`）。

同一文件系统可以被挂载到多个 mount point，这被称为 "bind mount"（多个路径是 bind 在一起的）：

> **mount --bind <old_directory> <new_directory>**

其实这并不难理解，它就像是文件系统层面的一个 **symbol link**。

不同的文件系统也可以共用同一个 mount point，新挂载的文件系统会 **覆盖** 掉这个位置之前的文件系统（覆盖，指暂时不可见，并不是把内容覆盖了）。

### rootfs

之前说挂载点必须是一个已存在的目录，所以 `/` 是怎么挂载上去的？蛋生鸡鸡生蛋？

rootfs 就是所谓的根文件系统。Linux 启动时，第一个必须挂载的是根文件系统，若系统不能从指定设备上挂载根文件系统，则系统会出错而退出启动。根文件系统包含系统启动时所必须的目录和关键性的文件

1. init 进程的应用程序必须运行在根文件系统上
2. 根文件系统提供了根目录 `/`
3. linux 挂载分区时所依赖的信息存放于根文件系统 `/etc/fstab` 这个文件中

### 分析 inode 的生命周期

- `super_operations->alloc_inode`：this method is called by `alloc_inode()` to allocate memory for struct inode and initialize it. If this function is not defined, a simple ‘struct inode’ is allocated. Normally alloc_inode will be used to **allocate a larger structure which contains a ‘struct inode’ embedded within it**.
- 那么，什么地方调用了 `alloc_inode` 呢？有三个函数 `new_inode_pseudo`,`iget5_locked`,`iget_locked`
  - `new_inode_pseudo` 是一个残废的函数，在 `proc` 这个仅存在于内存的文件系统中有使用。
  - `iget5_locked` 和 `iget_locked` 主要功能都是根据 ino 在 super_block 中找 inode，不过 `iget5_locked` 可以带上回调函数。
  - 研究 ext2 文件系统。`iget_locked` 被 `ext2_iget` 调用。虽然有若干个场景使用了这个函数，我们重点关注的是 [`ext2_lookup`](https://elixir.bootlin.com/linux/v4.20.17/source/fs/ext2/namei.c#L56)，他试图通过 `ext2_inode_by_name`，通过 dentry 的路径信息，去寻找 ino，然后再去寻找 inode。
- 所以，关键是 `inode_operations->lookup` 函数，这个函数实现了 dentry 到 inode 的转变，换句话说就是我们提供一个字符串路径，然后解析成 dentry，再去 lookup
  - lookup 可能会找到已经在内存中的 inode，还不在内存中的 inode，或者硬盘上也没有的 inode？
  - alloc_inode 中会调用 `inode_init_always` 中会初始化 inode 的一些 entry，在 ext2_iget 中会根据硬盘上的 inode 去初始化 inode 的一些 entry。
- `super_operations->destroy_inode`：this method is called by `destroy_inode()` to release resources allocated for struct inode. It is only required if `->alloc_inode` was defined and simply undoes anything done by `->alloc_inode`.

归纳一下，路径 -> filename_lookup -> ext4_lookup(在这里会根据文件名查 ino) -> ext4_iget -> iget_locked(ino -> inode) -> alloc_inode(分配内存，初始化)

```
#0  alloc_inode (sb=0xffff888006106800) at fs/inode.c:226
#1  0xffffffff812ebe9e in iget_locked (sb=0xffff888006106800, ino=0x134) at fs/inode.c:1192
#2  0xffffffff81399ee0 in __ext4_iget (sb=0xffff888006106800, ino=0x134, flags=<optimized out>, function=0xffffffff82081c00 <__func__.72414> "ext4_lookup", line=<optimized out>) at fs/ext4/inode.c:4878
#3  0xffffffff813b2bf7 in ext4_lookup (flags=<optimized out>, dentry=<optimized out>, dir=<optimized out>) at fs/ext4/namei.c:1701
#4  ext4_lookup (dir=0xffff8880066e1a98, dentry=0xffff88800673dd80, flags=<optimized out>) at fs/ext4/namei.c:1676
#5  0xffffffff812d7ee2 in __lookup_slow (name=0xffffc90000393cf0, dir=0xffff8880066d5000, flags=0x1) at fs/namei.c:1664
#6  0xffffffff812d7feb in lookup_slow (name=0xffffc90000393cf0, dir=0xffff8880066d5000, flags=0x1) at fs/namei.c:1681
#7  0xffffffff812d81ea in walk_component (nd=0xffffc90000393ce0, flags=0x0) at fs/namei.c:1801
#8  0xffffffff812d90d0 in lookup_last (nd=<optimized out>) at fs/namei.c:2264
#9  path_lookupat (nd=0xffffc90000393ce0, flags=0x0, path=<optimized out>) at fs/namei.c:2309
#10 0xffffffff812ddb3e in filename_lookup (dfd=<optimized out>, name=0xffff8880075f1000, flags=0x1, path=0xffffc90000393e30, root=<optimized out>) at fs/namei.c:2339
#11 0xffffffff812ddcea in user_path_at_empty (dfd=0xffffff9c, name=<optimized out>, flags=0x1, path=0xffffc90000393e30, empty=<optimized out>) at fs/namei.c:2599
#12 0xffffffff812d033d in user_path_at (path=<optimized out>, flags=<optimized out>, name=<optimized out>, dfd=<optimized out>) at ./include/linux/namei.h:49
#13 vfs_statx (dfd=0xffffff9c, filename=0x555f6ae2e8e0 "local", flags=0x800, stat=<optimized out>, request_mask=0x7ff) at fs/stat.c:187
#14 0xffffffff812d093e in vfs_stat (stat=<optimized out>, filename=<optimized out>) at ./include/linux/fs.h:3253
#15 __do_sys_newstat (filename=<optimized out>, statbuf=0x7ffd5ddbc3c0) at fs/stat.c:341
#16 0xffffffff812d0996 in __se_sys_newstat (statbuf=<optimized out>, filename=<optimized out>) at fs/stat.c:337
#17 __x64_sys_newstat (regs=<optimized out>) at fs/stat.c:337
#18 0xffffffff81004017 in do_syscall_64 (nr=<optimized out>, regs=0xffffc90000393f58) at arch/x86/entry/common.c:290
#19 0xffffffff81c0008c in entry_SYSCALL_64 () at arch/x86/entry/entry_64.S:175
```

## 内核读写文件

Since version 4.14 of Linux kernel, `vfs_read` and `vfs_write` functions are **no longer exported** for use in modules. Instead, functions exclusively for kernel's file access are provided:

```c
# Read the file from the kernel space.
ssize_t kernel_read(struct file *file, void *buf, size_t count, loff_t *pos);

# Write the file from the kernel space.
ssize_t kernel_write(struct file *file, const void *buf, size_t count,
            loff_t *pos);
```

Also, `filp_open` no longer accepts user-space string, so it can be used for kernel access **directly** (without dance with `set_fs`).

打开文件，可以参考一个 [驱动的例子](https://elixir.bootlin.com/linux/v4.20.17/source/drivers/target/target_core_file.c#L134)。

## Registering and Mounting a Filesystem

这是用于注册 file system type 的接口。

```c
extern int register_filesystem(struct file_system_type *);
extern int unregister_filesystem(struct file_system_type *);
```

一般的，我们可以定义一个我们 `file_system_type` 然后注册他。虽然它有很多字段，但是看起来下面的字段是必须的，代码来自 [5.17](https://elixir.bootlin.com/linux/latest/source/fs/ext4/super.c#L116)

```c
static struct file_system_type ext2_fs_type = {
 .owner  = THIS_MODULE,
 .name  = "ext2",
 .mount  = ext4_mount,
 .kill_sb = kill_block_super,
 .fs_flags = FS_REQUIRES_DEV,
};
```

上面我们提到了，`mount` 和 `kill_sb` 是“接口”，也就是函数指针。我们应该怎么去实现他们呢？参考一些代码，一般来说，会是简单封装下面几个函数之一，[`ext4_mount`](https://elixir.bootlin.com/linux/latest/source/fs/ext4/super.c#L6511) 就是对 `mount_bdev` 的简单封装。

```c
extern struct dentry *mount_bdev(struct file_system_type *fs_type,
 int flags, const char *dev_name, void *data,
 int (*fill_super)(struct super_block *, void *, int));
extern struct dentry *mount_single(struct file_system_type *fs_type,
 int flags, void *data,
 int (*fill_super)(struct super_block *, void *, int));
extern struct dentry *mount_nodev(struct file_system_type *fs_type,
 int flags, void *data,
 int (*fill_super)(struct super_block *, void *, int));
```

参照 `ext4_mount` 的代码。所以，看起来 `fill_super` 函数的实现才是重点所在。

我们之前提到，每个挂载的文件系统和 `super_block` 是一一对应的。顾名思义 `fill_super` 就是装填 `super_block`。他的三个参数分别是

- `struct super_block *sb` the superblock structure. The callback must initialize this properly.
- `void *data` arbitrary mount options, usually comes as an ASCII string (see “Mount Options” section)
- `int silent` whether or not to be silent on error

## fs_struct 和 files_struct

顺带一提，`task_struct` 中有两个结构

```c
/* Filesystem information: */
struct fs_struct  *fs;
/* Open file information: */
struct files_struct  *files;
```

我们常说的 **打开文件表** 指的是后者，`files_struct -> fdt` 指向了打开文件表，`fdtable -> fd` 是一个 `file` 数组。我们获得的 **文件描述符** 其实就是这个数组的下标，`fd[fd]` 就是一个 `file *` 类型。

```c
// include/linux/fdtable.h of linux-2.6.37
struct files_struct {
  /*
   * read mostly part
   */
        atomic_t count;
        struct fdtable __rcu *fdt;
        struct fdtable fdtab;
  /*
   * written part on a separate cache line in SMP
   */
        spinlock_t file_lock ____cacheline_aligned_in_smp;
        int next_fd;
        struct embedded_fd_set close_on_exec_init;
        struct embedded_fd_set open_fds_init;
        struct file __rcu * fd_array[NR_OPEN_DEFAULT];
};

struct fdtable {
        unsigned int max_fds;
        struct file __rcu **fd;      /* current fd array */
        fd_set *close_on_exec;
        fd_set *open_fds;
        struct rcu_head rcu;
        struct fdtable *next;
};
```

数据结构示意图如下，转载自知乎的陈硕大佬。

一个迷惑的点是 `fdtab` 和 `fdt` 有什么区别？为什么一个结构里有两个表？我看到一个解释是下面这样的，调试的时候发现有时 `fdt` 并不指向 `fdtab`，有时确实是一个东西。

> 为什么有两个 fdtable 呢？这是内核的一种优化策略。fdt 为指针，而 fdtab 为普通变量。一般情况下，fdt 是指向 fdtab 的，当需要它的时候，才会真正动态申请内存。因为默认大小的文件表足以应付大多数情况，大多数进程不会打开很多的文件，因此这样就可以避免频繁的内存申请。这也是内核的常用技巧之一。在创建时, 使用普通的变量或者数组，然后让指针指向它，作为默认情况使用。只有当进程使用量超过默认值时，才会动态申请内存。

## 分析 open 系统调用

`open`, `openat`, `creat` 都可以起到打开一个文件的作用。他们是不同的系统调用，不过真正的执行的代码是差不多的，进过一些检查，最后调用 [`do_sys_open()`](https://elixir.bootlin.com/linux/v5.4.168/source/fs/open.c#L1079)。

```c
long do_sys_open(int dfd, const char __user *filename, int flags,
                 umode_t mode);
// dfd: dirfd
// filename
// flags
// mode
```

阅读 [`do_sys_open()`](https://elixir.bootlin.com/linux/v5.4.168/source/fs/open.c#L1079) 源代码，执行流程大致如下（先忽略 flags）：

- 先调用 `getname`， 主要功能是在使用文件名之前将其拷贝到内核数据区，正常结束时返回内核分配的空间首地址。
- 在调用 `get_unused_fd_flags`，顾名思义是取得系统中可用的文件描述符 fd。
- 然后是重头戏，`struct file *f = do_filp_open(dfd, tmp, &op);`
- `fd_install`，感觉是把 `f` 存下来，再把 `fd` 和 `f` 关联起来。

阅读 [`do_filp_open()`](https://elixir.bootlin.com/linux/v5.4.168/source/fs/namei.c#L3550) 源代码。

- `set_nameidata`: 调用 `set_nameidata()` 保护当前进程现场信息，**`nameidata` 这个结构用来辅助路径查找**。
- 然后是重头戏，`filp = path_openat(&nd, op, flags | LOOKUP_RCU);`
- `restore_nameidata`

阅读 [`path_openat()`](https://elixir.bootlin.com/linux/v5.4.168/source/fs/namei.c#L3511) 源代码。重点关注忽略了所有失败情况的下面的代码

```c
file = alloc_empty_file(op->open_flag, current_cred());

const char *s = path_init(nd, flags);
while (!(error = link_path_walk(s, nd)) &&
       (error = do_last(nd, file, op)) > 0) {
    nd->flags &= ~(LOOKUP_OPEN|LOOKUP_CREATE|LOOKUP_EXCL);
    s = trailing_symlink(nd);
}
terminate_walk(nd);

return file;
```

## 利用 Wrapfs 管理权限

限制文件读写：

- 从 `file_operations.read` 和 `file_operations.write` 入手，并不好使，具体原因有待进一步发现。（可能是 `file_operations.read_iter` 和 `file_operations.write_iter` 的关系。因为就现在的文件系统，大部分都实现了后两者而不是前两者。）
- 从 `inode_operations.permission` 入手，相当于是可以动态的修改一个文件的 `rwx` 权限了，这样确实可以对读写进行有效控制，但是阻止不了移动、删除，因为移动和删除相当于是目录的权限管理了。
- 从 `inode_operations.fileattr_get` 入手（还有一个很具有迷惑性的方法 `getattr`）(4.4 没有这个方法！)
- 从 `file_operations.unlocked_ioctl` 和 `file_operations.compat_ioctl` 入手，结果发现在修改一个被我加了 `i` 属性的文件时根本没有调用过，只在 `lsattr` 的时候会调用，奇怪。
  - 跟踪发现是 `faccessat` 这个调用族做的检查

    ```
    faccessat(AT_FDCWD, "aaa", W_OK)  = -1 EPERM (Operation not permitted)
    faccessat(AT_FDCWD, "aaa", W_OK)  = 0
    ```

    源代码<https://elixir.bootlin.com/linux/v4.4.295/source/fs/open.c#L337>

- 考虑 `inode_operations.rename` 和 `inode_operations.unlink`. 因为跟踪发现他们和文件的移动和删除密切相关，用 `strace` 跟踪 mv 和 rm 的执行。

  ```
  mv => renameat2(AT_FDCWD, "../i.md", AT_FDCWD, "../i1.md", RENAME_NOREPLACE) = 0
  rm => unlinkat(AT_FDCWD, "aaa", 0)      = 0
  ```

总结：从 `permission`,`rename`,`unlink` 入手。

### 执行权限

以 Linux5.4 为例，跟踪 `inode_permission` 函数在 `execve` 的何时被调用进行权限检查。

```c
[#0] 0xffffffff812d8690 → inode_permission(inode=0xffff8880064f1650, mask=0x81)
[#1] 0xffffffff812d8aed → may_lookup(nd=<optimized out>)
[#2] 0xffffffff812d8aed → link_path_walk(name=0xffff888004ce2021 "bin/ls", nd=0xffffc9000020fd10)
[#3] 0xffffffff812db4c6 → link_path_walk(nd=<optimized out>, name=<optimized out>)
[#4] 0xffffffff812db4c6 → path_openat(nd=0xffffc9000020fd10, op=0xffffc9000020fe24, flags=<optimized out>)
[#5] 0xffffffff812ddfa1 → do_filp_open(dfd=<optimized out>, pathname=<optimized out>, op=0xffffc9000020fe24)
[#6] 0xffffffff812d16a7 → do_open_execat(fd=<optimized out>, name=0xffff888004ce2000, flags=<optimized out>)
[#7] 0xffffffff812d35c8 → __do_execve_file(fd=<optimized out>, filename=0xffff888004ce2000, flags=0x0, file=0x0 <fixed_percpu_data>, argv=<optimized out>, envp=<optimized out>)
[#8] 0xffffffff812d39a9 → do_execveat_common(flags=<optimized out>, filename=<optimized out>, fd=<optimized out>, argv=<optimized out>, envp=<optimized out>)
[#9] 0xffffffff812d39a9 → do_execve(__envp=<optimized out>, __argv=<optimized out>, filename=<optimized out>)
```

### 添加权限字段

怎么向 `inode` 结构添加东西呢？

- inode 的诞生：`super_operations->alloc_inode`: this method is called by [`alloc_inode()`](https://elixir.bootlin.com/linux/v5.4.168/source/fs/inode.c#L225) to allocate memory for struct inode and initialize it. If this function is not defined, a simple ‘struct inode’ is allocated. Normally `alloc_inode` will be used to **allocate a larger structure which contains a ‘struct inode’ embedded within it.**

  我们定制他来产生 `wrapfs_inode`

  `<fsname_iget>`: 从设备中读取 inode

- inode 的使用，从场景出发
  - 用户如果需要使用一个文件，他会使用 `open` 系列的系统调用，得到一个文件描述符。对于 kernel 来说，我们产生了一个 `file` 代表打开的文件，在上面介绍的进程的 `files` 字段中会存储所有打开的文件。之后的读写就针对 `file` 进行。
  - 所以 `open` 是怎么找到 `inode` 的呢？简单的说，根据路径进行遍历。
- inode 的回收：`super_operations->destroy_inode`: this method is called by [`destroy_inode()`](https://elixir.bootlin.com/linux/v5.4.168/source/fs/inode.c#L274) to release resources allocated for struct inode. It is only required if `super_operations->alloc_inode` was defined and simply undoes anything done by `super_operations->alloc_inode`.
- 由于我们的文件系统是完全存在于内存的，可以忽略 inode 的 dirty，write 等和设备同步的操作。

### 和用户交换信息

从用户获得的信息最好是 `filename` + `permission`。利用 `kern_path()` 函数可以根据文件名获得 `struct path`，里面有 `mnt` 还有 `dentry`，这样拿到对应的 inode 就不是问题。

发送给用户的信息可以是 `uuid+inode`，或者可以利用 `inode` 中的 `i_dentry` 链表选择一个文件名来保护，反正最后的权限会落到 inode。

## FUSE

[fuse - Filesystem in Userspace (FUSE) device.](https://man7.org/linux/man-pages/man4/fuse.4.html)

这个模型可以让你 **在 User Level** 实现文件系统，原理大致是 Kernel 作为 Client，而你的进程（往往是 Daemon）作为 Server，双方进行通信，你可以 Hook 一些操作。有一个 Python 的 API 绑定。

```sh
sudo apt install libfuse3-dev fuse3
pip3 install pyfuse3
```

---

<https://www.kernel.org/doc/html/latest/filesystems/vfs.html#struct-file-system-type>

<https://zhuanlan.zhihu.com/p/34280875>

<https://bean-li.github.io/vfs-inode-dentry/>

[解析open调用的系列文章，挺好的](https://juejin.cn/post/6844903926735568904)

[内核如何读写文件](https://stackoverflow.com/questions/1184274/read-write-files-within-a-linux-kernel-module)
