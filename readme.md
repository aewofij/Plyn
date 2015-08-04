# Plyn

Inspired by Seymour Papert's writings on the Logo programming language, and by
more recent functional reactive languages such as [Elm](http://elm-lang.org/)
and [Max](https://cycling74.com/), Plyn is an IDE and graphical dataflow
programming language for creating interactive "microworlds": sites of
interactive exploration, structured by the user.

Although Plyn offers low-level scripting via JavaScript, the environment is
designed around composing predefined "components" to create new functionality.
By offering a live-coding environment, as well as many tools to inspect behavior
throughout a program, Plyn eschews the need to ingest and regurgitate an API:
instead, Plyn encourages the user to create by experimentation and by "feeling
his way" around the system.

[thesis paper](http://david-lee.net/work/thesis.pdf)

_DL: I put this project aside for a while, but I'm still interested in working on it.
However, given my lack of experience with web apps when I wrote this version,
there is a lot to be brought up to snuff. In the meantime, my apologies for any
silliness._

## Running Plyn

1. Clone repository.

    ```
    $ git clone https://github.com/davidisaaclee/plyn
    ```

2. Install dependencies. (Note: Dependencies install into `js/lib`.)

    ```
    $ bower install
    ```

3. Host from project directory.
